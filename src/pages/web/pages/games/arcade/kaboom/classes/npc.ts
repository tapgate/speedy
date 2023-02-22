import { GameObj, TimerController } from 'kaboom';
import { Id, toast } from 'react-toastify';
import { dialogOpts } from '../shared/dialog';
import { IKaboomCtxExt } from '../shared/types';
import { Character, ICharacterDirectionEnum, ICharacterOpts } from './character';

export interface INPCOpts extends ICharacterOpts {
  talkingSpeed?: number;
  interactionDistance?: { x: number; y: number };
}

export class NPC extends Character {
  private _talkingSpeed = 1;
  private _interactionDistance = { x: 22, y: 1 };

  constructor(k: IKaboomCtxExt, opts: INPCOpts) {
    super(k, {
      ...opts,
      isNPC: true
    });

    this._talkingSpeed = opts.talkingSpeed || this._talkingSpeed;
    this._interactionDistance = opts.interactionDistance || this._interactionDistance;
  }

  init(level: GameObj) {
    super.init(level);
    const k = this.k;
    const body = this.object!;

    k.onKeyPress('e', () => {
      const npc = this.object;

      const playerObj = level.get('player').shift() as GameObj;

      if (playerObj) {
        const player = playerObj.instance;

        if (player && npc) {
          // check if player is close to the npc and is facing the npc
          if (
            Math.abs(playerObj.pos.y - npc.pos.y) < this._interactionDistance.y &&
            Math.abs(playerObj.pos.x - npc.pos.x) < this._interactionDistance.x &&
            player.isLookingAt(npc).x
          ) {
            this.interact(player);
          }
        }
      }
    });

    this.onOutOfBounds(() => {
      body.destroy();
    });

    return body;
  }

  openDialogue({
    messages,
    target,
    awaitInteraction = true,
    done
  }: {
    messages: string[];
    target?: Character;
    awaitInteraction?: boolean;
    done?: () => void;
  }) {
    const k = this.k;

    if (messages) {
      this.log('openDialogue', messages, target, awaitInteraction);

      const previousFacingDirection = this.facingDirection;

      const wordsPerSecond = 10 * this._talkingSpeed;
      const charactersPerWord = 4.7;
      const charTime = (charactersPerWord * wordsPerSecond) / 1000;

      if (target) {
        target.lockMovements();

        const targetObj = target.object;
        const body = this.object;

        if (targetObj && body) {
          const direction: ICharacterDirectionEnum =
            targetObj.pos.x > body.pos.x
              ? ICharacterDirectionEnum.RIGHT
              : ICharacterDirectionEnum.LEFT;

          this.setFacingDirection(direction);
        }
      }

      let messageShown: Id | undefined = toast(``, {
        ...dialogOpts,
        toastId: `${this.name}:dialogue`
      });

      let previousMessage = '';
      let charTimer: TimerController;
      let lineTimer: TimerController;
      let readyForNextLine = true;

      const nextLine = () => {
        const message = messages.shift();

        if (messageShown && message) {
          readyForNextLine = false;

          if (charTimer) {
            charTimer.cancel();
          }

          if (lineTimer) {
            lineTimer.cancel();
          }

          const addCharacter = (i: number) => {
            const renderMessage = message.substring(0, i);

            toast.update(messageShown!, {
              // render: previousMessage + renderMessage
              render: renderMessage
            });

            charTimer = k.wait(charTime, () => {
              if (i < message.length) {
                addCharacter(i + 1);
              }
            });

            if (i === message.length) {
              previousMessage += `\n${message}\n`;
              readyForNextLine = true;
              if (!awaitInteraction) {
                // on average people read around 150 words per minute
                // 150 words / 60 seconds = 2.5 words per second
                // on average there are 4.7 characters per word
                // since we spent some time writing this dialogue we can wait around 25% shorter than the average time it would take to read it
                const lineTime = (message.length / charactersPerWord) * 0.25;

                this.log('waiting for', lineTime, 'seconds');

                lineTimer = k.wait(lineTime);
              }
            }
          };

          addCharacter(1);
        } else {
          this.off('interact:next', nextLine);
          toast.dismiss(messageShown);

          k.wait(0.5, () => {
            messageShown = undefined;
            if (target) {
              this.setFacingDirection(previousFacingDirection);
              target.unlockMovements();
              this.emit('interact:done');
            }
            done?.();
          });
        }
      };

      if (awaitInteraction) {
        this.on('interact:next', nextLine);
        nextLine();
      } else {
        nextLine();
      }
    }
  }
}
