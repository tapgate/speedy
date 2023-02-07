import kaboom from 'kaboom';
import { useEffect, useRef, useState } from 'react';
import uuid from 'react-uuid';
import { Icon } from '../../../../../components/icons';
import MobileView from '../../../../../components/mobile-view';
import { useGame } from '../../../../../context/game';
import { useUser } from '../../../../../context/user';
import { IItem } from '../../../../../models/item';
import { IGameData } from '../../../../../utils/game';

enum IGameStateEnum {
  STARTING = 'starting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game-over'
}

enum ICharacterColorEnum {
  NONE = 'none',
  BLACK = 'black',
  WHITE = 'white',
  YELLOW = 'yellow',
  RED = 'red',
  GREEN = 'green'
}

enum ICharacterDirectionEnum {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

enum ICharacterStateEnum {
  IDLE = 'idle',
  WALKING = 'walking',
  JUMPING = 'jumping',
  FALLING = 'falling',
  ATTACKING = 'attacking',
  HURT = 'hurt',
  DEAD = 'dead'
}

enum IColorEnum {
  NONE = 'none',
  BLUE = 'blue',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  PINK = 'pink',
  ORANGE = 'orange',
  GRAY = 'gray'
}

function mergeImg(urls: any) {
  const promises: any[] = [];
  for (const url of urls) {
    const img = new Image();
    img.src = url;
    img.crossOrigin = 'anonymous';
    promises.push(
      new Promise((resolve, reject) => {
        img.onload = () => {
          resolve(img);
        };
        img.onerror = () => {
          reject(`failed to load ${url}`);
        };
      })
    );
  }
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((images) => {
        const canvas = document.createElement('canvas');

        const width = images[0].width;
        const height = images[0].height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          images.forEach((img, i) => {
            if (img.width === width && img.height === height) {
              ctx.drawImage(img, 0, 0);
            }
          });
          resolve(ctx.getImageData(0, 0, width, height));
        } else {
          reject();
        }
      })
      .catch((error) => reject(error));
  });
}

export interface IArcadeGameProps {
  outfit?: IItem | null;
  data?: IGameData;
  quit?: () => void;
}

export const ArcadeGame = ({ outfit, data, quit }: IArcadeGameProps) => {
  const FLOOR_HEIGHT = 32;
  const SPEED = 120;

  const [maxLives, setMaxLives] = useState(0);
  const [lives, setLives] = useState(0);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<IGameStateEnum>(IGameStateEnum.STARTING);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kaboomRef = useRef<any>(null);

  useEffect(() => {
    if (canvasRef.current) {
      loadGame(canvasRef.current);
    }

    const onResize = () => {
      // do nothing
    };

    window.addEventListener('resize', onResize);

    return () => {
      if (kaboomRef.current) {
        kaboomRef.current.destroy();
      }

      window.removeEventListener('resize', onResize);
    };
  }, []);

  const loadGame = (canvas: HTMLCanvasElement) => {
    kaboomRef.current = kaboom({
      global: false,
      canvas: canvas,
      scale: 4,
      font: 'sinko',
      debug: true
    });

    const {
      add,
      destroy,
      go,
      onUpdate,
      origin,
      loadSound,
      play,
      pos,
      sprite,
      width,
      height,
      area,
      vec2,
      Vec2,
      body,
      scene,
      rect,
      solid,
      color,
      center,
      onKeyPress,
      onKeyDown,
      onKeyRelease,
      isKeyDown,
      onTouchStart,
      onClick,
      loadSpriteAtlas,
      rand,
      move,
      cleanup,
      wait,
      CompList,
      onLoad,
      health,
      text,
      destroyAll,
      layers,
      layer,
      addLevel,
      camPos,
      fixed
    } = kaboomRef.current;

    loadSound('jump', '/sounds/jump.mp3');

    loadSound('crash', '/sounds/crash.mp3');

    loadSound('game-over', '/sounds/game-over.mp3');

    loadSound('bgm', '/music/eric-skiff-underclocked-no-copyright-8-bit-music-background.mp3');

    loadSound('game-over-bgm', '/music/monplaisir-soundtrack-no-copyright-8-bit-music.mp3');

    loadSpriteAtlas('images/sky/clouds.png', {
      cloud: {
        x: 0,
        y: 0,
        height: 256,
        width: 128,
        sliceX: 4,
        sliceY: 4,
        anims: {
          'type-1': { from: 8, to: 11, loop: true, speed: 15 },
          'type-2': { from: 12, to: 15, loop: true, speed: 15 },
          'type-3': { from: 0, to: 3, loop: true, speed: 15 },
          'type-4': { from: 4, to: 7, loop: true, speed: 15 }
        }
      }
    });

    const mapTile = {
      width: 16,
      height: 16
    };

    loadSpriteAtlas('images/map/001.png', {
      map001: {
        x: 0,
        y: 0,
        height: 128,
        width: 128,
        sliceX: 8,
        sliceY: 8
      },
      'ground-tl': {
        ...mapTile,
        x: 0,
        y: 0
      },
      'ground-tc': {
        ...mapTile,
        x: 16,
        y: 0
      },
      'ground-tr': {
        ...mapTile,
        x: 32,
        y: 0
      },
      'ground-ml': {
        ...mapTile,
        x: 0,
        y: 16
      },
      'ground-mc': {
        ...mapTile,
        x: 16,
        y: 16
      },
      'ground-mr': {
        ...mapTile,
        x: 32,
        y: 16
      },
      'ground-bl': {
        ...mapTile,
        x: 0,
        y: 32
      },
      'ground-bc': {
        ...mapTile,
        x: 16,
        y: 32
      },
      'ground-br': {
        ...mapTile,
        x: 32,
        y: 32
      },
      'ground-sm-t': {
        ...mapTile,
        x: 3,
        y: 0
      },
      'ground-sm-m': {
        ...mapTile,
        x: 0,
        y: 0
      },
      'ground-sm-b': {
        ...mapTile,
        x: 48,
        y: 32
      },
      'slab-l': {
        ...mapTile,
        x: 0,
        y: 48
      },
      'slab-c': {
        ...mapTile,
        x: 16,
        y: 48
      },
      'slab-r': {
        ...mapTile,
        x: 32,
        y: 48
      },
      'slab-sm': {
        ...mapTile,
        x: 48,
        y: 48
      }
    });

    const skybox = [
      rect(width(), height()),
      pos(width(), height()),
      origin('botright'),
      color(127, 200, 255),
      layer('sky'),
      fixed()
    ];

    class GameObject {
      public id: string;

      private _object: any;

      public get object() {
        return this._object;
      }

      constructor() {
        this.id = uuid();
      }

      load(compList: typeof CompList) {
        const gameObj = add(compList);

        console.log('gameObj', gameObj);

        this._object = gameObj;
      }

      destroy() {
        destroy(this._object);
      }
    }

    class Character extends GameObject {
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
      public facingDirection: ICharacterDirectionEnum = ICharacterDirectionEnum.RIGHT;
      public previousDirection: ICharacterDirectionEnum = ICharacterDirectionEnum.RIGHT;

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
        color?: ICharacterColorEnum | null | undefined,
        outfit?: IItem | null | undefined
      ) {
        super();

        this.color = color ?? ICharacterColorEnum.NONE;

        if (outfit) {
          this.outfit = outfit;
        }

        this.generateSprites();
      }

      async generateSprites() {
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
          console.log(imageData);
          loadSpriteAtlas(imageData, {
            player: {
              x: 0,
              y: 0,
              height: 256,
              width: 128,
              sliceX: 4,
              sliceY: 4,
              anims: {
                'walk-up': { from: 8, to: 11, loop: true, speed: 15 },
                'walk-left': { from: 12, to: 15, loop: true, speed: 15 },
                'walk-down': { from: 0, to: 3, loop: true, speed: 15 },
                'walk-right': { from: 4, to: 7, loop: true, speed: 15 },
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
      }

      reset() {
        this.health = this.maxHealth;

        setMaxLives(player.maxHealth);
        setLives(player.maxHealth);
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
          // check if wasd keys are still active
          if (isKeyDown('w') || isKeyDown('a') || isKeyDown('s') || isKeyDown('d')) {
            if (
              this._state !== ICharacterStateEnum.WALKING &&
              this._state !== ICharacterStateEnum.JUMPING
            ) {
              this._state = ICharacterStateEnum.WALKING;
              player.object.play(`walk-${player.facingDirection}`);
            }
          }
        });

        body.on('hurt', () => {
          play('crash');
          this.health -= 1;
        });

        body.on('death', () => {
          play('game-over');
          go('game-over');
        });
      }

      jump() {
        const body = this.object;

        const _jump = () => {
          body.play(`jump-${this.facingDirection}`);
          body.jump(this.jumpHeight * 500);
          play('jump');
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
        const body = this.object;
        const speed = this.speed * 100 * 2;

        if (this.canMove) {
          this._state = ICharacterStateEnum.WALKING;

          switch (direction) {
            case ICharacterDirectionEnum.UP:
              if (this.canClimb) {
                body.move(0, -speed);
              }
              break;
            case ICharacterDirectionEnum.LEFT:
              body.move(-speed, 0);
              break;
            case ICharacterDirectionEnum.DOWN:
              if (this.canDesend) {
                body.move(0, speed);
              }
              break;
            case ICharacterDirectionEnum.RIGHT:
              body.move(speed, 0);
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

    const player = new Character(ICharacterColorEnum.YELLOW, outfit);

    let bgmAudio: any;

    scene('game-over', () => {
      bgmAudio?.stop();
      bgmAudio = play('game-over-bgm');

      add(skybox);

      add([text('Game Over', 32), pos(width() / 2, height() / 2), origin('center')]);

      add([text('Click to restart', 16), pos(width() / 2, height() / 2 + 32), origin('center')]);

      onClick(() => {
        go('game');
      });

      onKeyPress('space', () => {
        go('game');
      });

      onTouchStart(() => {
        go('game');
      });
    });

    scene('game', () => {
      layers(['sky', 'clouds', 'bg', 'game', 'ui'], 'game');

      bgmAudio?.stop();

      bgmAudio = play('bgm');

      console.log('game');

      add(skybox);

      // floor
      const map = addLevel(
        [
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          '(##################################################################################################)',
          '[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
          '{==================================================================================================}'
        ],
        {
          width: 16,
          height: 16,
          '(': () => [sprite('ground-tl'), area(), solid()],
          '#': () => [sprite('ground-tc'), area(), solid()],
          ')': () => [sprite('ground-tr'), area(), solid()],
          '[': () => [sprite('ground-ml'), area(), solid()],
          '@': () => [sprite('ground-mc'), area(), solid()],
          ']': () => [sprite('ground-mr'), area(), solid()],
          '{': () => [sprite('ground-bl'), area(), solid()],
          '=': () => [sprite('ground-bc'), area(), solid()],
          '}': () => [sprite('ground-br'), area(), solid()]
        }
      );

      player.load([
        'player',
        health(player.maxHealth),
        sprite('player'),
        pos(map.getPos(6, 4)),
        origin('center'),
        area({
          offset: vec2(0, 2),
          scale: vec2(0.25, 0.25)
        }),
        body()
      ]);

      onKeyPress('space', () => {
        player.jump();
      });

      // player movement WASD
      onKeyDown('w', () => {
        player.walk(ICharacterDirectionEnum.UP);
      });

      onKeyDown('a', () => {
        player.walk(ICharacterDirectionEnum.LEFT);
      });

      onKeyDown('s', () => {
        player.walk(ICharacterDirectionEnum.DOWN);
      });

      onKeyDown('d', () => {
        player.walk(ICharacterDirectionEnum.RIGHT);
      });

      onKeyPress(['a', 'd', 'w', 's'], () => {
        console.log('test', player.facingDirection);
        player.object.play(`walk-${player.facingDirection}`);
      });

      onKeyRelease(['a', 'd', 'w', 's'], () => {
        player.object.play(`idle-${player.facingDirection}`);
        player.stopWalking();
      });

      onUpdate(() => {
        camPos(player.object.pos);
      });

      setGameState(IGameStateEnum.PLAYING);
    });

    onLoad(() => {
      setLoading(false);
    });
  };

  const startGame = () => {
    if (!loading) {
      setLoading(true);

      const k = kaboomRef.current;

      if (k) {
        k.go('game');
      }
    }
  };

  const tap = () => {
    if (gameState == IGameStateEnum.STARTING) {
      startGame();
    }
  };

  return (
    <div className="relative w-full h-full">
      {gameState == IGameStateEnum.STARTING ? (
        <div className="absolute inset-0 bg-gray-700 z-20">
          <div className="w-full h-full flex flex-wrap justify-center items-center overflow-auto pb-4">
            <div className="w-full md:w-1/4 max-w-[80vw]">
              <div className="w-full p-4 flex justify-center lg:text-2xl font-black">
                TAPGATE ADVENTURE PARADISE
              </div>
              <div className="w-full max-h-[54%] p-4 mb-4 overflow-auto flex flex-wrap items-center p-4 bg-white border-2 border-black text-black/75 tracking-wide rounded-lg">
                <div className="w-full text-left">Welcome</div>
                <div className="w-full p-2 text-xs text-lighter">
                  Get ready for an adrenaline rush with{' '}
                  <span className="text-blue-700 font-semibold">T.A.P</span>! Test your reflexes and
                  show off your skills by soaring over obstacles, fighting enimies such as rats,
                  boars and other typical RPG monsters. Collect trinkets, tonics and snake oil!
                  err... and Treasure while you play. Will you earn the legendary sword? So what are
                  you waiting for? Put your game face on and let's see how far you can soar! Good
                  luck, challenger!
                </div>
                <div className="w-full text-left">Controls</div>
                <div className="w-full p-2 text-xs text-lighter">
                  <div className="w-full mb-2">
                    Use <span className="text-red-700 font-semibold">WASD</span> to move,{' '}
                    <span className="text-red-700 font-semibold">SPACE</span> to jump and enter to
                    interact / attack Look I realize W is used to go up and this is a platformer but
                    I'm trying to be a bit more creative here.
                  </div>
                </div>
                <div className="w-full text-left">Support</div>
                <div className="w-full p-2 text-xs text-lighter">
                  You can help support us in the following ways:
                  <ul className="list-decimal p-2 px-6 flex flex-wrap gap-y-2">
                    <li>
                      Donating <span className="text-red-700 font-semibold">OMI</span> or your
                      favorite cryptocurrency / NFT to QR bellow
                    </li>
                    <li>
                      Following us on{' '}
                      <a
                        className="text-blue-700 font-semibold underline"
                        href="https://twitter.com/nexusque"
                        target="_blank"
                        rel="noreferrer">
                        twitter
                      </a>{' '}
                      for all the latest updates and news.
                    </li>
                  </ul>{' '}
                  <div className="w-full flex justify-center p-4">
                    <div className="flex justify-center flex-wrap gap-y-2">
                      <img src="images/crypto/donation-qr.png" alt="" />
                      <div
                        className="text-xs select-text hover:underline cursor-pointer active:opacity-50"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            '0x0f22d432a183B91C364FEcc44f43FE1565E88ec3'
                          );
                        }}>
                        0x0f22d432a183B91C364FEcc44f43FE1565E88ec3
                      </div>
                    </div>
                  </div>
                  We thank you for being a part of this journey
                </div>
              </div>
              {!loading ? (
                <div
                  className="w-full text-lg md:text-5xl font-semibold text-center p-2 md:p-4 bg-green-400 text-white rounded-lg border-2 border-green-600 cursor-pointer hover:opacity-75 active:opacity-50"
                  onClick={() => tap()}>
                  PLAY
                </div>
              ) : (
                <div className="w-full text-lg md:text-5xl font-semibold text-center p-2 md:p-4 bg-green-400 text-white rounded-lg border-2 border-green-600 opacity-50">
                  LOADING
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-0 right-0 p-2 lives flex flex-row-reverse">
            {Array.from({ length: maxLives ?? 0 }).map((_, i) => (
              <div key={i} className="relative flex justify-center items-center w-[32px] h-[32px]">
                {lives > i ? (
                  <Icon name="HeartSolid" className="text-xl text-red" />
                ) : (
                  <Icon name="HeartSolid" className="text-xl text-black" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <canvas
        id="scene"
        className={`w-full h-full bg-red-500 ${
          gameState == IGameStateEnum.STARTING ? 'opacity-0 pointer-events-none' : ''
        }`}
        ref={canvasRef}></canvas>
    </div>
  );
};

const ArcadeGameContainer = () => {
  const { outfit, loading: userLoading } = useUser();
  const { data, quitGame: quit } = useGame();

  if (userLoading) return null;

  return (
    <MobileView>
      <ArcadeGame outfit={outfit} data={data} quit={quit} />
    </MobileView>
  );
};

export default ArcadeGameContainer;
