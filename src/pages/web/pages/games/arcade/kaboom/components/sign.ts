import { GameObj, KaboomCtx } from 'kaboom';
import { Id, toast } from 'react-toastify';
import { Character, ICharacterDirectionEnum } from '../classes/character';
import { dialogOpts } from '../shared/dialog';

export interface ISignOpts {
  tag?: string;
  player: Character;
  message?: string;
}

const Sign = (k: KaboomCtx, opts: ISignOpts) => {
  const { tag = 'sign', player, message = 'This is a sign' } = opts;

  return [
    tag,
    k.sprite('props/sign'),
    k.area({
      collisionIgnore: ['*']
    }),
    k.body({ isStatic: true }),
    k.z(0),
    {
      add: (s: GameObj) => {
        let messageShown: Id | null = null;

        const showMessage = () => {
          messageShown = toast(message, {
            ...dialogOpts,
            toastId: s.id ?? 'sign'
          });
        };

        s.onUpdate(() => {
          // check if player is infront of sign and facing it
          const playerObj = player.object;

          if (playerObj) {
            const facingDirection = player.facingDirection;

            const canActivate =
              Math.abs(playerObj.pos.x - s.pos.x) < 16 &&
              Math.abs(playerObj.pos.y - s.pos.y) < 38 &&
              Math.abs(playerObj.pos.y - s.pos.y) > 36 &&
              facingDirection === ICharacterDirectionEnum.UP;

            if (messageShown && !canActivate) {
              toast.dismiss(messageShown);
              messageShown = null;
            } else if (canActivate && !messageShown) {
              showMessage();
            }
          }
        });
      }
    }
  ];
};

export default Sign;
