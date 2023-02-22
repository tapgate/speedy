import {
  KaboomCtx,
  GameObj,
  SpriteComp,
  SpriteAtlasData,
  Key,
  GamepadButton,
  Vec2,
  Collision,
  PosComp
} from 'kaboom';
import { clamp } from 'lodash';
import { Mixin } from 'ts-mixer';
import { IItem } from '../../../../../../../models/item';
import { IKaboomCtxExt } from '../shared/types';
import { EventObject } from './_event_object';
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
  NONE = 'down',
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

export interface ICharacterOpts {
  name?: string;
  tag?: string;
  isNPC?: boolean;
  isBlocking?: boolean;
  maxHealth?: number;
  color?: ICharacterColorEnum;
  outfit?: IItem | null;
  speed?: number;
  sprintSpeed?: number;
  jumpHeight?: number;
  jumpSpeed?: number;
}

export class Character extends Mixin(GameObject, EventObject) {
  private _name: string;

  public get name() {
    return this._name;
  }

  private _tag: string;

  public get tag() {
    return this._tag;
  }

  private _spawnPoint!: Vec2;

  public get spawnPoint() {
    return this._spawnPoint;
  }

  private _isNPC = true;

  public get isNPC() {
    return this._isNPC;
  }

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

  private _facingDirection: ICharacterDirectionEnum = ICharacterDirectionEnum.RIGHT;

  public get facingDirection() {
    return this._facingDirection;
  }

  private _walkingDirection: ICharacterDirectionEnum = ICharacterDirectionEnum.RIGHT;

  public get walkingDirection() {
    return this._walkingDirection;
  }

  private _outlined = false;

  public get outlined() {
    return this._outlined;
  }

  public set outlined(outlined: boolean) {
    this._outlined = outlined;
  }

  private _color: ICharacterColorEnum | undefined;

  public set color(color: ICharacterColorEnum) {
    this._color = color;
    this.updateSprites();
  }

  public get color() {
    return this._color ?? ICharacterColorEnum.NONE;
  }

  private _outfit: IItem | null | undefined;

  public set outfit(outfit: IItem | null) {
    this._outfit = outfit;
    this.updateSprites();
  }

  public get outfit() {
    return this._outfit ?? null;
  }

  private _colorSprite: GameObj<SpriteComp> | undefined;
  private _outlineSprite: GameObj<SpriteComp> | undefined;
  private _outfitSprite: GameObj<SpriteComp> | undefined;

  private _canInteract = true;

  constructor(k: IKaboomCtxExt, opts?: ICharacterOpts) {
    const {
      name,
      isNPC,
      isBlocking,
      maxHealth,
      color,
      outfit,
      speed,
      sprintSpeed,
      jumpHeight,
      jumpSpeed
    } = opts ?? {};

    let { tag } = opts ?? {};

    tag = tag ?? 'character';

    super(k, [
      tag,
      k.health(maxHealth ?? 3),
      k.sprite('character/outline'),
      k.anchor('bot'),
      k.area({
        collisionIgnore: isNPC ? (!isBlocking ? ['character', 'npc'] : undefined) : undefined,
        scale: k.vec2(0.4, 0.32),
        offset: k.vec2(0, -68.43)
      }),
      k.body({
        maxVelocity: 400,
        jumpForce: 700,
        mass: 0.01,
        isStatic: isNPC
      }),
      k.state(
        'idle',
        ['idle', 'walking', 'sprinting', 'jumping', 'falling', 'attacking', 'hurt', 'dead'],
        {
          idle: ['walking', 'sprinting', 'jumping', 'falling', 'attacking', 'hurt', 'dead'],
          walking: ['idle', 'sprinting', 'attack', 'jumping', 'falling', 'hurt', 'dead'],
          sprinting: ['idle', 'walking', 'jumping', 'falling', 'hurt', 'dead'],
          jumping: ['idle', 'walking', 'hurt', 'dead'],
          falling: ['idle', 'walking', 'jumping', 'hurt', 'dead'],
          attacking: ['idle', 'walking', 'jumping', 'falling', 'hurt', 'dead'],
          hurt: ['idle', 'walking', 'falling', 'dead']
        }
      ),
      k.doubleJump(2),
      k.z(isNPC ? 1 : 2)
    ]);

    this._name = name ?? `${tag} character`;

    this._tag = tag;

    this._isNPC = isNPC ?? true;

    if (maxHealth) {
      this._maxHealth = maxHealth;
      this._health = maxHealth;
    }

    this._speed = speed ?? 1;
    this._sprintSpeed = sprintSpeed ?? 3;
    this._jumpHeight = jumpHeight ?? 1;
    this._jumpSpeed = jumpSpeed ?? 1;

    this.color = color ?? ICharacterColorEnum.NONE;

    if (outfit) {
      this.outfit = outfit;
    }
  }

  log(...args: any[]) {
    console.log(`${this.name}:`, ...args);
  }

  static generateSprites(k: KaboomCtx) {
    const folders = ['/', '/color', '/outline', '/outfit'];

    const spriteData = {
      height: 256,
      width: 128,
      sliceX: 4,
      sliceY: 4,
      x: 0,
      y: 0,
      anims: {
        'walk-up': { from: 8, to: 11, loop: true, speed: 8 },
        'walk-left': { from: 12, to: 15, loop: true, speed: 8 },
        'walk-down': { from: 0, to: 3, loop: true, speed: 8 },
        'walk-right': { from: 4, to: 7, loop: true, speed: 8 },
        'sprint-up': { from: 8, to: 11, loop: true, speed: 16 },
        'sprint-left': { from: 12, to: 15, loop: true, speed: 16 },
        'sprint-down': { from: 0, to: 3, loop: true, speed: 16 },
        'sprint-right': { from: 4, to: 7, loop: true, speed: 16 },
        'idle-up': { from: 8, to: 8 },
        'idle-left': { from: 12, to: 12 },
        'idle-down': { from: 0, to: 0 },
        'idle-right': { from: 4, to: 4 },
        'jump-up': { from: 9, to: 9 },
        'jump-left': { from: 13, to: 13 },
        'jump-down': { from: 1, to: 1 },
        'jump-right': { from: 5, to: 5 }
      }
    };

    const colors = Object.values(ICharacterColorEnum);

    let atlas: SpriteAtlasData = {};

    folders.forEach((folder) => {
      switch (folder) {
        case '/color':
          colors.forEach((color) => {
            atlas = {};

            atlas[`character/color/${color}`] = spriteData;

            try {
              k.loadSpriteAtlas(`images/character/color/${color}.png`, atlas);
            } catch {
              k.loadSpriteAtlas(`images/character/outline.png`, atlas);
            }
          });
          break;
        case '/outline':
          atlas = {};

          atlas[`character/outline`] = spriteData;
          k.loadSpriteAtlas(`images/character/outline.png`, atlas);
          break;
        case '/outfit':
          ['naked-censor', 'emojii-panda'].forEach((outfit) => {
            atlas = {};

            atlas[`character/outfit/${outfit}`] = spriteData;

            try {
              k.loadSpriteAtlas(`images/character/outfit/${outfit}.png`, atlas);
            } catch {
              k.loadSpriteAtlas(`images/character/outline.png`, atlas);
            }
          });
          break;
        default:
          break;
      }
    });
  }

  enterState(state: string) {
    const body = this.object;

    if (body) {
      if (state !== body.state) {
        this.log(`entering state: ${state}`, body);
        body.enterState(state);
      }
    }
  }

  setFacingDirection(direction: ICharacterDirectionEnum) {
    const body = this.object;

    this._facingDirection = direction;

    if (body) {
      body.facingDirection = direction;
    }
  }

  setMovingDirection(direction: ICharacterDirectionEnum) {
    const body = this.object;

    this._walkingDirection = direction;

    if (body) {
      body.walkingDirection = direction;
    }
  }

  reset(callback?: (character: Character) => void): void {
    const body = this.object;

    this._health = this.maxHealth;
    this._canJump = true;
    this._canDoubleJump = true;
    this._canMove = true;
    this._canClimb = false;
    this._canDesend = false;
    this.setFacingDirection(ICharacterDirectionEnum.RIGHT);
    this.setMovingDirection(ICharacterDirectionEnum.NONE);
    this._outlined = false;

    if (body) {
      body.health = this.maxHealth;
      this.enterState('idle');
    }

    this.updateSprites();

    callback?.(this);
  }

  updateSprites() {
    const k = this.k;

    const body = this.object!;

    const color = this.color;
    const outfit = this.outfit;

    const comps = [
      k.z(0),
      k.pos(0, 0),
      k.anchor('bot'),
      k.area({ scale: 0.5, offset: k.vec2(0, -44) })
    ];

    if (body) {
      this._colorSprite = body.add([...comps, k.sprite(`character/color/${color}`)]);

      this._outlineSprite = body.add([...comps, k.z(1), k.sprite('character/outline')]);

      this._outfitSprite = body.add([
        ...comps,
        k.z(2),
        k.sprite(`character/outfit/${outfit?.code ?? 'naked-censor'}`)
      ]);

      this.play(`idle-${this._facingDirection}`);
    }
  }

  play(name: string) {
    this._colorSprite?.play(name);
    this._outlineSprite?.play(name);
    this._outfitSprite?.play(name);

    this.object?.play(name);
  }

  move(direction?: ICharacterDirectionEnum, speed?: number) {
    const k = this.k;
    const body = this.object;

    if (body && this.canMove) {
      if (!direction) {
        direction = this._walkingDirection;
      }

      if (!speed) {
        speed = this._speed * 10 * 2;

        if (this.isSprinting) {
          speed *= this._sprintSpeed;
        }
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
    } else if (body) {
      if (body.state === 'walking' || body.state === 'sprinting') {
        this.enterState('idle');
      }
    }
  }

  init(level: GameObj<any>): GameObj {
    super.init(level);

    this.reset();

    const k = this.k;

    const body = this.object!;

    this._spawnPoint = body.pos;

    body.instance = this;

    this.log('init', body);

    body.onBeforePhysicsResolve((collision: Collision) => {
      if (
        collision.target.is(['platform', 'soft']) &&
        body.isJumping() &&
        body.pos.y > collision.target.pos.y
      ) {
        collision.preventResolution();
      }
    });

    body.onGround(() => {
      const body = this.object;

      this._canJump = true;
      this._canDoubleJump = false;

      if (body) {
        if (this._walkingDirection !== ICharacterDirectionEnum.NONE) {
          this.enterState('walking');
        } else {
          this.enterState('idle');
        }
      }
    });

    body.on('hurt', () => {
      const body = this.object;

      if (body) {
        this._health = body.hp();

        if (this._health <= 0) {
          this._health = 0;
          this.enterState('dead');
        } else {
          this.enterState('hurt');
        }
      }
    });

    body.onStateUpdate('idle', () => {
      this.play(`idle-${this._facingDirection}`);

      if (this._walkingDirection !== ICharacterDirectionEnum.NONE) {
        this.enterState('walking');
      }
    });

    body.onStateEnter('walking', () => {
      this.play(`walk-${this._walkingDirection}`);
    });

    body.onStateUpdate('walking', () => {
      this.move();

      if (this.isSprinting) {
        this.enterState('sprinting');
      }
    });

    body.onStateEnter('sprinting', () => {
      this.play(`sprint-${this._walkingDirection}`);
    });

    body.onStateUpdate('sprinting', () => {
      this.move();

      if (!this.isSprinting) {
        if (this._walkingDirection !== ICharacterDirectionEnum.NONE) {
          this.enterState('walking');
        }
      }
    });

    body.onStateEnter('jumping', () => {
      this.play(`jump-${this._facingDirection}`);
    });

    body.onStateUpdate('jumping', () => {
      if (this._walkingDirection !== ICharacterDirectionEnum.NONE) {
        this.move();
      }
    });

    body.onStateEnter('hurt', () => {
      const body = this.object;

      if (!this.isNPC) {
        k.play('crash');
      }

      if (body) {
        this.lockMovements();

        body.use(k.opacity(0.5));
        k.wait(0.1, () => {
          body.use(k.opacity(1));
        });
        k.wait(0.15, () => {
          body.use(k.opacity(0.5));
        });
        k.wait(0.2, () => {
          body.use(k.opacity(1));
        });
        k.wait(0.25, () => {
          body.use(k.opacity(0.5));
        });
        k.wait(0.3, () => {
          body.use(k.opacity(1));
          this.unlockMovements();

          if (this._walkingDirection !== ICharacterDirectionEnum.NONE) {
            this.enterState('walking');
          } else {
            this.enterState('idle');
          }
        });
      }
    });

    body.onStateEnter('dead', () => {
      if (this.isNPC) {
        this.destroy();
      } else {
        k.play('game-over');
        k.go('game-over');
      }
    });

    body.onCollideEnd('boundary', (obj: GameObj) => {
      this.outOfBounds();
    });

    body.onUpdate(() => {
      const pos = body.pos;

      const leftBoundary = level.get('left-boundary').shift() as GameObj;
      const leftBoundaryPos = leftBoundary?.pos;

      const rightBoundary = level.get('right-boundary').shift() as GameObj;
      const rightBoundaryPos = rightBoundary?.pos;

      const bounds = {
        left: leftBoundaryPos.x + leftBoundary.width + body.width * 0.25,
        right: rightBoundaryPos.x - rightBoundary.width - body.width * 0.25,
        bottom: leftBoundaryPos.y - leftBoundary.height - body.height * 0.25
      };

      // clamp camera position to bounds
      pos.x = clamp(pos.x, bounds.left, bounds.right);
      pos.y = clamp(pos.y, 0, bounds.bottom);
    });

    if (!this.isNPC) {
      k.onKeyPress('space', () => {
        this.jump();
      });

      k.onGamepadButtonPress('south', () => {
        this.jump();
      });

      // this movement WASD
      k.onKeyPress('w', () => {
        this.walk(ICharacterDirectionEnum.UP);
      });

      k.onGamepadButtonPress('dpad-up', () => {
        this.walk(ICharacterDirectionEnum.UP);
      });

      k.onKeyPress('a', () => {
        this.walk(ICharacterDirectionEnum.LEFT);
      });

      k.onGamepadButtonPress('dpad-left', () => {
        this.walk(ICharacterDirectionEnum.LEFT);
      });

      k.onKeyPress('s', () => {
        this.walk(ICharacterDirectionEnum.DOWN);
      });

      k.onGamepadButtonPress('dpad-down', () => {
        this.walk(ICharacterDirectionEnum.DOWN);
      });

      k.onKeyPress('d', () => {
        this.walk(ICharacterDirectionEnum.RIGHT);
      });

      k.onGamepadButtonPress('dpad-right', () => {
        this.walk(ICharacterDirectionEnum.RIGHT);
      });

      ['a', 'd', 'w', 's'].forEach((key) => {
        k.onKeyRelease(key as Key, () => {
          // check if the other keys are still pressed
          if (
            !k.isKeyDown('w' as Key) &&
            !k.isKeyDown('a' as Key) &&
            !k.isKeyDown('s' as Key) &&
            !k.isKeyDown('d' as Key)
          ) {
            this.stopWalking();
          } else {
            // change direction of closest key
            if (k.isKeyDown('w' as Key)) {
              this.walk(ICharacterDirectionEnum.UP);
            } else if (k.isKeyDown('a' as Key)) {
              this.walk(ICharacterDirectionEnum.LEFT);
            } else if (k.isKeyDown('s' as Key)) {
              this.walk(ICharacterDirectionEnum.DOWN);
            } else if (k.isKeyDown('d' as Key)) {
              this.walk(ICharacterDirectionEnum.RIGHT);
            }
          }
        });
      });

      ['dpad-up', 'dpad-left', 'dpad-down', 'dpad-right'].forEach((key) => {
        k.onGamepadButtonRelease(key as unknown as GamepadButton, () => {
          // check if the other keys are still pressed
          if (
            !k.isGamepadButtonDown('dpad-up') &&
            !k.isGamepadButtonDown('dpad-left') &&
            !k.isGamepadButtonDown('dpad-down') &&
            !k.isGamepadButtonDown('dpad-right')
          ) {
            this.stopWalking();
          }
        });
      });

      k.onKeyPress('shift' as Key, () => {
        this.isSprinting = true;
      });

      k.onGamepadButtonPress('east', () => {
        this.isSprinting = true;
      });

      k.onKeyRelease('shift' as Key, () => {
        this.isSprinting = false;
        if (this._walkingDirection !== ICharacterDirectionEnum.NONE) {
          this.enterState('walking');
        }
      });

      k.onGamepadButtonRelease('east', () => {
        k.wait(0.1, () => {
          this.isSprinting = false;
          if (this._walkingDirection !== ICharacterDirectionEnum.NONE) {
            this.enterState('walking');
          }
        });
      });

      let previousTouchPos = k.vec2(0, 0);
      let jumpOnRelease: number | null = null;

      // based on touch drag direction (mobile)
      k.onTouchMove((pos: Vec2, t: Touch) => {
        if (jumpOnRelease === t.identifier) {
          jumpOnRelease = null;
        }

        if (this.canMove) {
          let direction = ICharacterDirectionEnum.NONE;

          const diff = pos.sub(previousTouchPos);
          previousTouchPos = pos;

          if (Math.abs(diff.x) > 0.01) {
            if (diff.x > 0) {
              direction = ICharacterDirectionEnum.RIGHT;
            } else {
              direction = ICharacterDirectionEnum.LEFT;
            }
          }

          if (direction !== ICharacterDirectionEnum.NONE) {
            this.walk(direction);
          }
        }
      });

      k.onTouchStart((pos: Vec2, t: Touch) => {
        jumpOnRelease = t.identifier;
      });

      k.onTouchEnd((pos: Vec2, t: Touch) => {
        if (jumpOnRelease === t.identifier) {
          jumpOnRelease = null;
          this.jump();
        } else {
          previousTouchPos = k.vec2(0, 0);
          this.stopWalking();
        }
      });
    }

    return body;
  }

  jump(jumpHeight?: number) {
    const k = this.k;
    const body = this.object;
    if (body) {
      if (body.isGrounded() || this._canDoubleJump) {
        if (this._canMove && this._canJump) {
          if (!body.isGrounded() && this._canDoubleJump) {
            this._canDoubleJump = false;
          } else {
            this._canDoubleJump = true;
          }

          if (!this.isNPC) {
            k.play('jump');
          }

          body.jump(jumpHeight ?? this.jumpHeight * 400);
          this.enterState('jumping');
        }
      }
    }
  }

  walk(direction: ICharacterDirectionEnum) {
    const k = this.k;
    const body = this.object;

    if (body) {
      if (this.canMove) {
        this.setFacingDirection(direction);
        this.setMovingDirection(direction);
        this.enterState('walking');
      }
    }
  }

  stopWalking() {
    const body = this.object;
    if (body) {
      this.setMovingDirection(ICharacterDirectionEnum.NONE);
      this.enterState('idle');
    }
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
    this._canClimb = false;
    this._canDesend = false;
  }

  lookAt(target: GameObj | PosComp) {
    const body = this.object;

    if (target && body) {
      // check if character is within 32px of the body and on the same y axis
      const isNearby =
        target.pos.x > body.pos.x - 16 &&
        target.pos.x < body.pos.x + 16 &&
        target.pos.y > body.pos.y - 16 &&
        target.pos.y < body.pos.y + 16;

      // set direction of body based on character position
      if (
        target.pos.x < body.pos.x &&
        target.pos.y > body.pos.y - 64 &&
        target.pos.y < body.pos.y + 64
      ) {
        this.setFacingDirection(ICharacterDirectionEnum.LEFT);
      } else if (
        target.pos.x > body.pos.x &&
        target.pos.y > body.pos.y - 64 &&
        target.pos.y < body.pos.y + 64
      ) {
        this.setFacingDirection(ICharacterDirectionEnum.RIGHT);
      }

      if (
        target.pos.y < body.pos.y &&
        target.pos.x > body.pos.x - 16 &&
        target.pos.x < body.pos.x + 16
      ) {
        this.setFacingDirection(ICharacterDirectionEnum.UP);
      } else if (
        target.pos.y > body.pos.y &&
        target.pos.x > body.pos.x - 16 &&
        target.pos.x < body.pos.x + 16
      ) {
        this.setFacingDirection(ICharacterDirectionEnum.DOWN);
      }
    }
  }

  isLookingAt(target: GameObj | PosComp): { x: boolean; y: boolean } {
    const body = this.object;

    if (target && body) {
      // check if character is within 32px of the body and on the same y axis
      const isNearby =
        target.pos.x > body.pos.x - 16 &&
        target.pos.x < body.pos.x + 16 &&
        target.pos.y > body.pos.y - 16 &&
        target.pos.y < body.pos.y + 16;

      // set direction of body based on character position
      if (
        target.pos.x < body.pos.x &&
        target.pos.y > body.pos.y - 64 &&
        target.pos.y < body.pos.y + 64
      ) {
        return {
          x: true,
          y: false
        };
      } else if (
        target.pos.x > body.pos.x &&
        target.pos.y > body.pos.y - 64 &&
        target.pos.y < body.pos.y + 64
      ) {
        return {
          x: true,
          y: false
        };
      }

      if (
        target.pos.y < body.pos.y &&
        target.pos.x > body.pos.x - 16 &&
        target.pos.x < body.pos.x + 16
      ) {
        return {
          x: false,
          y: true
        };
      } else if (
        target.pos.y > body.pos.y &&
        target.pos.x > body.pos.x - 16 &&
        target.pos.x < body.pos.x + 16
      ) {
        return {
          x: false,
          y: true
        };
      }
    }

    return {
      x: false,
      y: false
    };
  }

  onInteract(call: (character: Character) => void) {
    return this.on('interact', call);
  }

  interact(character: Character) {
    this.log('interact', { _canInteract: this._canInteract, character });
    if (this._canInteract) {
      this._canInteract = false;
      const done = () => {
        this.off('interact:done', done);
        this.k.wait(0.5, () => {
          this._canInteract = true;
        });
      };

      this.on('interact:done', done);
      this.emit('interact', character);
    } else {
      this.emit('interact:next', character);
    }
  }

  onOutOfBounds(call: (character: Character) => void) {
    return this.on('outOfBounds', call);
  }

  outOfBounds() {
    this.log('outOfBounds');
    this.emit('outOfBounds');
  }
}
