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
  MOVING = 'walking',
  JUMPING = 'jumping',
  FALLING = 'falling',
  ATTACKING = 'attacking',
  HURT = 'hurt',
  DEAD = 'dead'
}

export class Character extends GameObject {
  public get level() {
    return Math.floor(Math.pow(this.exp + 1, 1 / 3));
  }

  private _exp = 0;

  public get exp() {
    return this._exp;
  }

  public get expToNextLevel() {
    return Math.pow(this.level + 1, 3) - 1;
  }

  private _maxHealth = 3;

  public get maxHealth() {
    return this._maxHealth;
  }

  private _health = 3;

  public get health() {
    return this._health;
  }

  private _speed = 1;

  public get speed() {
    return this._speed;
  }

  private _sprintSpeed = 3;

  public get sprintSpeed() {
    return this._sprintSpeed;
  }

  private _isSprinting = false;

  public get isSprinting() {
    return this._isSprinting;
  }

  public set isSprinting(isSprinting: boolean) {
    this._isSprinting = isSprinting;
  }

  private _jumpHeight = 1;

  public get jumpHeight() {
    return this._jumpHeight;
  }

  private _jumpSpeed = 1;

  public get jumpSpeed() {
    return this._jumpSpeed;
  }

  private _canJump = true;

  public get canJump() {
    return this._canJump;
  }

  private _canDoubleJump = true;

  public get canDoubleJump() {
    return this._canDoubleJump;
  }

  private _canMove = true;

  public get canMove() {
    return this._canMove;
  }

  private _canClimb = false;

  public get canClimb() {
    return this._canClimb;
  }

  private _canDesend = false;

  public get canDesend() {
    return this._canDesend;
  }

  private _previousDirection: ICharacterDirectionEnum = ICharacterDirectionEnum.RIGHT;

  public get previousDirection() {
    return this._previousDirection;
  }

  private _facingDirection: ICharacterDirectionEnum = ICharacterDirectionEnum.RIGHT;

  public get facingDirection() {
    return this._facingDirection;
  }

  private set facingDirection(direction: ICharacterDirectionEnum) {
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
    this._health = this.maxHealth;
    this._canJump = true;
    this._canDoubleJump = true;
    this._canMove = true;
    this._canClimb = false;
    this._canDesend = false;
    this._facingDirection = ICharacterDirectionEnum.RIGHT;
    this._previousDirection = ICharacterDirectionEnum.RIGHT;
    this._state = ICharacterStateEnum.IDLE;
    this._outlined = false;

    callback?.(this);
  }

  load(compList: any): void {
    super.load([
      ...compList,
      {
        facingDirection: ICharacterDirectionEnum.DOWN,
        instance: this
      }
    ]);

    this.reset();

    const body = this.object;

    body.play('idle-down');

    body.onClick(() => {
      this.outlined = true;
      console.log('clicked');
    });

    body.onGround(() => {
      this._canJump = true;
      this._canDoubleJump = false;
      this._state = ICharacterStateEnum.IDLE;
    });

    body.onUpdate(() => {
      const k = this.k;

      // check if wasd keys are still active
      if (k.isKeyDown('w') || k.isKeyDown('a') || k.isKeyDown('s') || k.isKeyDown('d')) {
        if (
          this._state !== ICharacterStateEnum.MOVING &&
          this._state !== ICharacterStateEnum.JUMPING
        ) {
          this._state = ICharacterStateEnum.MOVING;
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
      this._health -= 1;
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
      this._canJump = false;
      this._canDoubleJump = true;
      this._state = ICharacterStateEnum.JUMPING;
    } else if (this.canDoubleJump) {
      _jump();
      this._canDoubleJump = false;
    }
  }

  walk(direction: ICharacterDirectionEnum) {
    const k = this.k;
    const body = this.object;
    let speed = this._speed * 10 * 2;

    if (this.canMove) {
      this._state = ICharacterStateEnum.MOVING;

      if (this.isSprinting) {
        speed *= this._sprintSpeed;
      }

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

    this._previousDirection = direction;
    this.facingDirection = direction;
  }

  stopWalking() {
    const body = this.object;
    body.move(0, 0);
    this._state = ICharacterStateEnum.IDLE;
  }

  lockMovements() {
    this._canMove = false;
    this._canJump = false;
    this._canDoubleJump = false;
    this._canClimb = false;
    this._canDesend = false;
  }

  unlockMovements() {
    this._canMove = true;
    this._canJump = true;
    this._canDoubleJump = true;
    this._canClimb = true;
    this._canDesend = true;
  }
}
