import { KaboomCtx } from 'kaboom';
import { IItem } from '../../../../../../../models/item';
import { mergeImg } from '../helpers';
import { GameObject } from './_object';

export enum ICharacterColorEnum {
  NONE = 'none',
  BLACK = 'black',
  WHITE = 'white',
  YELLOW = 'yellow',
  RED = 'red',
  GREEN = 'green'
}

export enum ICharacterDirectionEnum {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

export enum ICharacterStateEnum {
  IDLE = 'idle',
  WALKING = 'walking',
  JUMPING = 'jumping',
  FALLING = 'falling',
  ATTACKING = 'attacking',
  HURT = 'hurt',
  DEAD = 'dead'
}

export class Character extends GameObject {
  public maxHealth = 3;
  public health = 3;
  public speed = 1;
  public jumpHeight = 1;
  public jumpSpeed = 1;
  public canJump = true;
  public canDoubleJump = true;
  public canMove = true;
  public canClimb = false;
  public canDesend = false;
  public previousDirection: ICharacterDirectionEnum = ICharacterDirectionEnum.RIGHT;

  private _facingDirection: ICharacterDirectionEnum = ICharacterDirectionEnum.RIGHT;

  public get facingDirection() {
    return this._facingDirection;
  }

  public set facingDirection(direction: ICharacterDirectionEnum) {
    this._facingDirection = direction;
    this.object.facingDirection = direction;
  }

  private _state: ICharacterStateEnum = ICharacterStateEnum.IDLE;

  public get state() {
    return this._state;
  }

  private _outlined = false;

  public get outlined() {
    return this._outlined;
  }

  public set outlined(outlined: boolean) {
    this._outlined = outlined;
    this.generateSprites();
  }

  private _color: ICharacterColorEnum | undefined;

  public set color(color: ICharacterColorEnum) {
    this._color = color;
    // this.generateSprites();
  }

  public get color() {
    return this._color ?? ICharacterColorEnum.NONE;
  }

  private _outfit: IItem | null | undefined;

  public set outfit(outfit: IItem | null) {
    this._outfit = outfit;
    // this.generateSprites();
  }

  public get outfit() {
    return this._outfit ?? null;
  }

  constructor(
    k: KaboomCtx,
    color?: ICharacterColorEnum | null | undefined,
    outfit?: IItem | null | undefined
  ) {
    super(k);

    this.color = color ?? ICharacterColorEnum.NONE;

    if (outfit) {
      this.outfit = outfit;
    }

    this.generateSprites();
  }

  async generateSprites() {
    const k = this.k;

    const sprites = [
      `images/character/color/${this.color}.png`,
      `images/character/outline.png`,
      ...(this.outlined ? [`images/character/outline-hover.png`] : []),
      ...(this.outfit
        ? [
            `images/character/outfit/${this.outfit?.code}.png`,
            ...(this.outlined ? [`images/character/outfit/${this.outfit?.code}-hover.png`] : [])
          ]
        : [`images/character/outfit/naked-censor.gif`])
    ];

    mergeImg(sprites).then((imageData: any) => {
      k.loadSpriteAtlas(imageData, {
        player: {
          x: 0,
          y: 0,
          height: 256,
          width: 128,
          sliceX: 4,
          sliceY: 4,
          anims: {
            'walk-up': { from: 8, to: 11, loop: true, speed: 8 },
            'walk-left': { from: 12, to: 15, loop: true, speed: 8 },
            'walk-down': { from: 0, to: 3, loop: true, speed: 8 },
            'walk-right': { from: 4, to: 7, loop: true, speed: 8 },
            'idle-up': { from: 8, to: 8 },
            'idle-left': { from: 12, to: 12 },
            'idle-down': { from: 0, to: 0 },
            'idle-right': { from: 4, to: 4 },
            'jump-up': { from: 9, to: 9 },
            'jump-left': { from: 13, to: 13 },
            'jump-down': { from: 1, to: 1 },
            'jump-right': { from: 5, to: 5 }
          }
        }
      });
    });

    mergeImg([`images/character/color/${this.color}.png`, `images/character/outline.png`]).then(
      (imageData: any) => {
        k.loadSpriteAtlas(imageData, {
          npc: {
            x: 0,
            y: 0,
            height: 256,
            width: 128,
            sliceX: 4,
            sliceY: 4,
            anims: {
              'walk-up': { from: 8, to: 11, loop: true, speed: 8 },
              'walk-left': { from: 12, to: 15, loop: true, speed: 8 },
              'walk-down': { from: 0, to: 3, loop: true, speed: 8 },
              'walk-right': { from: 4, to: 7, loop: true, speed: 8 },
              'idle-up': { from: 8, to: 8 },
              'idle-left': { from: 12, to: 12 },
              'idle-down': { from: 0, to: 0 },
              'idle-right': { from: 4, to: 4 },
              'jump-up': { from: 9, to: 9 },
              'jump-left': { from: 13, to: 13 },
              'jump-down': { from: 1, to: 1 },
              'jump-right': { from: 5, to: 5 }
            }
          }
        });
      }
    );
  }

  reset(callback?: (character: Character) => void): void {
    this.health = this.maxHealth;
    this.canJump = true;
    this.canDoubleJump = true;
    this.canMove = true;
    this.canClimb = false;
    this.canDesend = false;
    this.facingDirection = ICharacterDirectionEnum.RIGHT;
    this.previousDirection = ICharacterDirectionEnum.RIGHT;
    this._state = ICharacterStateEnum.IDLE;
    this._outlined = false;

    callback?.(this);
  }

  load(compList: any): void {
    super.load(compList);

    this.reset();

    const body = this.object;

    body.play('idle-down');

    body.onClick(() => {
      this.outlined = true;
      console.log('clicked');
    });

    body.onGround(() => {
      this.canJump = true;
      this.canDoubleJump = false;
      this._state = ICharacterStateEnum.IDLE;
    });

    body.onUpdate(() => {
      const k = this.k;

      // check if wasd keys are still active
      if (k.isKeyDown('w') || k.isKeyDown('a') || k.isKeyDown('s') || k.isKeyDown('d')) {
        if (
          this._state !== ICharacterStateEnum.WALKING &&
          this._state !== ICharacterStateEnum.JUMPING
        ) {
          this._state = ICharacterStateEnum.WALKING;
          body.play(`walk-${this.facingDirection}`);
        }
      } else {
        if (this._state === ICharacterStateEnum.IDLE) {
          body.play(`idle-${this.facingDirection}`);
        }
      }
    });

    body.on('hurt', () => {
      const k = this.k;

      k.play('crash');
      this.health -= 1;
    });

    body.on('death', () => {
      const k = this.k;

      k.play('game-over');
      k.go('game-over');
    });
  }

  jump() {
    const k = this.k;
    const body = this.object;

    const _jump = () => {
      body.play(`jump-${this.facingDirection}`);
      body.jump(this.jumpHeight * 350);
      k.play('jump');
    };

    if (body.isGrounded() && this.canJump) {
      _jump();
      this.canJump = false;
      this.canDoubleJump = true;
      this._state = ICharacterStateEnum.JUMPING;
    } else if (this.canDoubleJump) {
      _jump();
      this.canDoubleJump = false;
    }
  }

  walk(direction: ICharacterDirectionEnum) {
    const k = this.k;
    const body = this.object;
    const speed = this.speed * 10 * 2;

    if (this.canMove) {
      this._state = ICharacterStateEnum.WALKING;

      switch (direction) {
        case ICharacterDirectionEnum.UP:
          if (this.canClimb) {
            // lerp up
            body.pos.y = k.lerp(body.pos.y, body.pos.y - speed, 0.1);
          }
          break;
        case ICharacterDirectionEnum.LEFT:
          // lerp to the left
          body.pos.x = k.lerp(body.pos.x, body.pos.x - speed, 0.1);
          break;
        case ICharacterDirectionEnum.DOWN:
          if (this.canDesend) {
            // lerp down
            body.pos.y = k.lerp(body.pos.y, body.pos.y + speed, 0.1);
          }
          break;
        case ICharacterDirectionEnum.RIGHT:
          // lerp to the right
          body.pos.x = k.lerp(body.pos.x, body.pos.x + speed, 0.1);
          break;
      }
    }

    this.previousDirection = direction;
    this.facingDirection = direction;
  }

  stopWalking() {
    const body = this.object;
    body.move(0, 0);
    this._state = ICharacterStateEnum.IDLE;
  }
}
