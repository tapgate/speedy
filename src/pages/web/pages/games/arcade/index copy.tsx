import anime from 'animejs';
import { padStart, random } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import uuid from 'react-uuid';
import useSound from 'use-sound';
import Character, { CharacterFacingDirectionEnum } from '../../../../../components/character';
import CoolDown from '../../../../../components/cooldown';
import { Icon } from '../../../../../components/icons';
import MobileView from '../../../../../components/mobile-view';
import Sprite from '../../../../../components/sprite';
import Trigger from '../../../../../components/trigger';
import { useGame } from '../../../../../context/game';
import { useUser } from '../../../../../context/user';
import { IItem } from '../../../../../models/item';
import { IGameData } from '../../../../../utils/game';
import { CSSDimensionsWithPixelSize } from '../../../../../utils/pixles';

enum ArcadeGameColorEnum {
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

enum ArcadeGameStateEnum {
  STARTING = 'starting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game-over'
}

enum TileSectionEnum {
  BEGINING = 'begining',
  MIDDLE = 'middle',
  END = 'end'
}

interface ITile {
  id: string;
  x: number;
  y: number;
  hasObstacle?: boolean;
  hasHealth?: boolean;
}

enum MapItemTypeEnum {
  HEALTH = 'health',
  BONUS = 'bonus'
}

enum MapObjectTypeEnum {
  CLOUD = 'cloud',
  OBSTACLE = 'obstacle',
  ITEM = 'item',
  TRIGGER = 'trigger'
}

class MapObject {
  public id = '';
  public x?: number = 0;
  public y?: number = 0;
  public offsetX?: number = 0;
  public offsetY?: number = 0;
  public speed = 1;
  public speedInSec? = 1;
  public width = 0;
  public height = 0;
  public type!: MapObjectTypeEnum;
  public itemType?: MapItemTypeEnum;
  public value: any;
  public color: ArcadeGameColorEnum = ArcadeGameColorEnum.NONE;

  public parentID?: string;
  public children: MapObject[] = [];

  constructor(type: MapObjectTypeEnum) {
    this.id = uuid();
    this.type = type;
  }
}

interface IArcadeAudio {
  muted: boolean;
  volume: number;
}

interface iArcadePointsMultiplierMod {
  amount: number;
  color: ArcadeGameColorEnum;
  timeout: number;
}

interface IArcadeMods {
  rushMode?: boolean;
  rushModeSpeed?: number;
  jumpHeight?: number;
  pointsMultiplier: iArcadePointsMultiplierMod;
  invincible?: boolean;
}

class ArcadeGameMode {
  public state = ArcadeGameStateEnum.STARTING;

  public mods: IArcadeMods = {
    rushMode: false,
    rushModeSpeed: 1,
    jumpHeight: 1,
    pointsMultiplier: {
      amount: 1,
      color: ArcadeGameColorEnum.NONE,
      timeout: 0
    },
    invincible: true
  };

  public speed = 1;
  public gravity = 1;
  public maxJumpCount = 2;
  public maxLives = 3;
  public lives = 3;
  public canJump = true;
  public canDoubleJump = true;
  public jumpHeight = 1;
  public jumpSpeed = 1;
  public jumpCooldown = 1;
  public isJumping = false;
  public feet = 0;
  public jumpCount = 0;

  public spawnTileSpeed = 100;
  public spawnTileCount = 5;

  public spawnObstacleSpeed = 2;
  public spawnItemSpeed = 5;
  public spawnCloudSpeed = 1;

  public mapLeftPadding = 150;
  public tileWidth = 16;
  public tileHeight = 150;

  public cloudChance = 75;
  public itemChance = 25;

  public audio: IArcadeAudio = {
    muted: false,
    volume: 100
  };

  public objectsInteracted: { [key: string]: boolean } = {};
  public objectsCollected: { [key: string]: boolean } = {};

  public jumpSfx = '/sounds/jump.mp3';

  public crashSfx = '/sounds/crash.mp3';

  public gameOverSfx = '/sounds/game-over.mp3';

  public bgm = '/music/eric-skiff-underclocked-no-copyright-8-bit-music-background.mp3';

  public gameOverBgm = '/music/monplaisir-soundtrack-no-copyright-8-bit-music.mp3';

  public defaultFloorPosition = { x: 0, y: 0 };
  public currentFloorPosition = { x: 0, y: 0 };

  updateData(data?: IGameData) {
    let _data = data;

    if (!_data) {
      _data = {
        speed: 1,
        maxLives: 3
      } as IGameData;
    }

    this.speed = _data.speed;
    this.spawnTileSpeed = (1 / _data.speed) * 100;
  }

  collideWith(object: MapObject): boolean {
    if (object.parentID) {
      if (this.objectsInteracted[object.parentID]) {
        return false;
      }
    }

    if (!this.objectsInteracted[object.id]) {
      this.objectsInteracted[object.id] = true;

      if (object.parentID) {
        this.objectsInteracted[object.parentID] = true;
      }

      if (object.type === MapObjectTypeEnum.OBSTACLE) {
        this.takeLife();
      } else if (object.type === MapObjectTypeEnum.ITEM) {
        switch (object.itemType) {
          case MapItemTypeEnum.HEALTH:
            this.jumpCount--;
            if (this.jumpCount < 0) {
              this.jumpCount = 0;
            }
            this.giveLife();
            break;
          case MapItemTypeEnum.BONUS:
            this.feet += object.value;
            break;
        }
      } else if (object.type === MapObjectTypeEnum.TRIGGER) {
        this.feet += object.value * (this.mods.pointsMultiplier.amount ?? 1);
      }

      return true;
    }

    return false;
  }

  collect(object: MapObject): boolean {
    if (!this.objectsCollected[object.id]) {
      this.objectsCollected[object.id] = true;

      if (object.type === MapObjectTypeEnum.ITEM) {
        switch (object.itemType) {
          case MapItemTypeEnum.HEALTH:
            this.giveLife();
            break;
          case MapItemTypeEnum.BONUS:
            if (this.mods.pointsMultiplier.color === object.color) {
              if (this.mods.pointsMultiplier.amount == 1) {
                this.mods.pointsMultiplier.amount = object.value;
              } else {
                this.mods.pointsMultiplier.amount += object.value;
              }
              this.mods.pointsMultiplier.timeout += 15;
            } else {
              this.mods.pointsMultiplier.amount = object.value;
              this.mods.pointsMultiplier.color = object.color;
              this.mods.pointsMultiplier.timeout = 15;
            }

            break;
        }

        if (object.itemType !== MapItemTypeEnum.BONUS) {
          this.resetPointsMultiplier();
        }
      }

      return true;
    }

    return false;
  }

  resetPointsMultiplier() {
    this.mods.pointsMultiplier = {
      amount: 1,
      color: ArcadeGameColorEnum.NONE,
      timeout: 0
    };
  }

  takeLife() {
    if (this.mods.invincible) {
      return;
    }

    this.lives -= 1;

    if (this.lives <= 0) {
      this.lives = 0;
      this.state = ArcadeGameStateEnum.GAME_OVER;
    }
  }

  giveLife() {
    this.lives += 1;

    if (this.lives > this.maxLives) {
      this.lives = this.maxLives;
    }
  }

  reset() {
    this.state = ArcadeGameStateEnum.STARTING;
    this.lives = this.maxLives;
    this.feet = 0;
    this.jumpCount = 0;
    this.objectsInteracted = {};
    this.objectsCollected = {};
  }

  start() {
    this.state = ArcadeGameStateEnum.PLAYING;
  }

  togglePause() {
    if (this.state !== ArcadeGameStateEnum.GAME_OVER) {
      if (this.state === ArcadeGameStateEnum.PLAYING) {
        this.state = ArcadeGameStateEnum.PAUSED;
      } else {
        this.state = ArcadeGameStateEnum.PLAYING;
      }
    }
  }

  pause() {
    if (this.state !== ArcadeGameStateEnum.GAME_OVER) {
      this.state = ArcadeGameStateEnum.PAUSED;
    }
  }

  resume() {
    if (this.state !== ArcadeGameStateEnum.GAME_OVER) {
      this.state = ArcadeGameStateEnum.PLAYING;
    }
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
  }

  mute() {
    this.audio.muted = true;
  }

  unmute() {
    this.audio.muted = false;
  }
}

interface IArcadeGameSoundControllerProps {
  game: ArcadeGameMode;
  started?: boolean;
  jumped?: boolean;
  crashed?: boolean;
}

const ArcadeGameSoundController = ({ game, jumped, crashed }: IArcadeGameSoundControllerProps) => {
  const [playJumpSfx] = useSound(game.jumpSfx, {
    volume: (game.audio.volume / 100) * 0.1,
    interrupt: true
  });
  const [playCrashSfx] = useSound(game.crashSfx, {
    volume: (game.audio.volume / 100) * 0.1,
    interrupt: true
  });

  useEffect(() => {
    if (jumped && !game.audio.muted) {
      playJumpSfx();
    }
  }, [jumped]);

  useEffect(() => {
    if (crashed && !game.audio.muted) {
      playCrashSfx();
    }
  }, [crashed]);

  return null;
};

export interface IArcadeGameProps {
  outfit?: IItem | null;
  data?: IGameData;
  quit?: () => void;
}

export const ArcadeGame = ({ outfit, data, quit }: IArcadeGameProps) => {
  const [game] = useState<ArcadeGameMode>(new ArcadeGameMode());
  const [loading, setLoading] = useState<boolean>(false);

  const [mapObjects, setMapObjects] = useState<Map<string, MapObject>>(
    new Map<string, MapObject>([])
  );

  const [speedDampening, setSpeedDampening] = useState<number>(1);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [crashed, setCrashed] = useState<boolean>(false);

  const sceneRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);
  const timeTillNextObstacleSpawnRef = useRef<number>(Date.now() + 1000 * game.spawnObstacleSpeed);
  const timeTillNextItemSpawnRef = useRef<number>(Date.now() + 1000 * game.spawnItemSpeed);
  const timeTillNextCloudSpawnRef = useRef<number>(Date.now() + 1000 * game.spawnCloudSpeed);
  const cameraRef = useRef<HTMLDivElement>(null);

  const characterRef = useRef<HTMLDivElement>(null);
  const characterPushRef = useRef<anime.AnimeInstance | null>(null);
  const characterJumpRef = useRef<anime.AnimeInstance | null>(null);
  const characterFallRef = useRef<anime.AnimeInstance | null>(null);
  const hitBoxRef = useRef<HTMLDivElement>(null);
  const audioBGMRef = useRef<HTMLAudioElement>(null);
  const audioGOMRef = useRef<HTMLAudioElement>(null);

  const mapObjectsRef = useRef<Map<string, MapObject>>(mapObjects);

  const jumpingFrameRef = useRef<number>(0);

  const possibleWidths = [...Array(5).fill(16), ...Array(3).fill(32)];

  const possibleColors = [
    ArcadeGameColorEnum.BLUE,
    ArcadeGameColorEnum.YELLOW,
    ArcadeGameColorEnum.RED
  ];

  useEffect(() => {
    game.updateData(data);
  }, [data]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (crashed) {
      setCrashed(false);
    }
  }, [crashed]);

  useEffect(() => {
    mapObjectsRef.current = mapObjects;
  }, [mapObjects]);

  useEffect(() => {
    if (game.lives <= 0) return;

    // check if mobile, if so force landscape
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    if (isMobile()) {
      const orientation = window.screen.orientation.type;
      if (orientation !== 'landscape-primary') {
        //  cancle previous lock attemp
        try {
          screen.orientation.unlock();
          window.screen.orientation.lock('landscape-primary');
        } catch (e) {
          //  do nothing
        }
      }
    }

    const keyBeingPressed: any = {};

    // on spacebar press jump
    const keyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!keyBeingPressed[e.code]) {
          keyBeingPressed[e.code] = true;
          jump();
        }
      }
    };

    const keyUp = (e: KeyboardEvent) => {
      keyBeingPressed[e.code] = false;
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    // on window resize
    const resize = () => {
      const pixleSize = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
      );

      const character = characterRef.current;
      const hitBox = hitBoxRef.current;

      // reset character offsetTop
      if (character) {
        character.style.top = ``;
      }

      const mapObjects = mapObjectsRef.current;

      // increase speed or decrease speed based on window size percentage
      const windowSize = window.innerWidth;
      const windowSizePercentage = 1920 / windowSize;
      const speedDampening = windowSizePercentage > 1 ? 1 : windowSizePercentage;
      setSpeedDampening(speedDampening);
    };

    resize();

    window.addEventListener('resize', resize);

    let timeStamp = Date.now();
    let timeCharacterWasDamanged = 0;

    const triggerColor = (color: ArcadeGameColorEnum) => {
      const mapObjects = mapObjectsRef.current;

      // get all elements by class name trigger-color
      const elements = document.querySelectorAll('.trigger-' + color);

      // loop through all elements
      elements.forEach((element) => {
        const el = element as HTMLElement;

        // get map object
        const mapObject = mapObjects.get(el.id);

        if (mapObject) {
          game.collect(mapObject);

          // get element rect
          const elRect = el.getBoundingClientRect();

          // check if element is in view
          if (elRect.x + elRect.width > 0 && elRect.x < window.innerWidth) {
            el.style.left = `${elRect.x}px`;
            el.style.transition = 'all 0s';
            el.style.animationDuration = '0.8s';
            el.classList.remove('map-object');
            el.classList.add('animate__animated', 'animate__zoomOutUp');
          }
        }
      });
    };

    const update = () => {
      const bgmAudio = audioBGMRef.current;
      const gomAudio = audioGOMRef.current;

      const currentTime = Date.now();
      const timeDelta = currentTime - timeStamp;
      timeStamp = currentTime;

      const mapObjects = mapObjectsRef.current;

      spawnCloudIfPossible();

      if (game.state !== ArcadeGameStateEnum.STARTING) {
        if (game.state !== ArcadeGameStateEnum.PLAYING) {
          // get overlay element
          const overlay = document.querySelector('.overlay') as HTMLElement;
          overlay.classList.remove('hidden');
          overlay.classList.remove('animate__fadeOut');
          overlay.classList.add('animate__fadeIn');
        } else {
          // get overlay element
          const overlay = document.querySelector('.overlay') as HTMLElement;
          overlay.classList.remove('animate__fadeIn');
          overlay.classList.add('animate__fadeOut');
        }
      }

      if ([ArcadeGameStateEnum.GAME_OVER, ArcadeGameStateEnum.PAUSED].includes(game.state)) {
        // get all animated-object elements
        const animatedObjectElements = document.querySelectorAll('.animated-object:not(.cloud)');

        // pause animation states
        animatedObjectElements.forEach((element) => {
          const el = element as HTMLElement;
          el.style.animationPlayState = 'paused';
        });
      } else {
        // get all animated-object elements
        const animatedObjectElements = document.querySelectorAll('.animated-object:not(.cloud)');

        // resume animation states
        animatedObjectElements.forEach((element) => {
          const el = element as HTMLElement;
          el.style.animationPlayState = 'running';
        });
      }

      if (game.state !== ArcadeGameStateEnum.GAME_OVER) {
        if (game.state === ArcadeGameStateEnum.PLAYING) {
          spawnObstacleIfPossible();
          spawnItemIfPossible();
        }
        const hitBox = hitBoxRef.current;
        const character = characterRef.current;

        if (character) {
          if (timeCharacterWasDamanged + 300 < currentTime) {
            character.classList.remove('animate__flash');
            timeCharacterWasDamanged = 0;
          }
        }

        mapObjects.forEach((mapObject) => {
          const mapObjectElement = document.getElementById(mapObject.id);
          const element = mapObjectElement as HTMLElement;

          if (element && mapObject) {
            const elementRect = element.getBoundingClientRect();

            if (character && hitBox) {
              const hitBoxRect = hitBox.getBoundingClientRect();

              switch (mapObject.type) {
                case MapObjectTypeEnum.OBSTACLE:
                  {
                    // check if obstacle is in hitbox
                    // get child .obstacle element
                    const obstacleElement = element.querySelector('.obstacle') as HTMLElement;
                    const obstacleRect = obstacleElement.getBoundingClientRect();

                    if (
                      hitBoxRect.x + hitBoxRect.width > obstacleRect.x &&
                      hitBoxRect.x < obstacleRect.x + obstacleRect.width &&
                      hitBoxRect.y + hitBoxRect.height > obstacleRect.y &&
                      hitBoxRect.y < obstacleRect.y + obstacleRect.height
                    ) {
                      const collided = game.collideWith(mapObject);
                      if (collided) {
                        setCrashed(true);
                        // obstacleElement.style.left = `${obstacleRect.x + 50}px`;
                        // obstacleElement.style.transition = 'all 0s';
                        // obstacleElement.style.animationDuration = '0.3s';
                        // obstacleElement.classList.remove('map-object');
                        // obstacleElement.classList.add(
                        //   'animate__animated',
                        //   'animate__rotateOutUpRight'
                        // );

                        // if (!game.mods.invincible) {
                        //   character.classList.add('animate__flash');
                        //   character.style.animationDuration = '0.3s';
                        // }

                        // move character to the opposite direction of the obstacle
                        const characterRect = character.getBoundingClientRect();
                        const characterLeft = characterRect.x;
                        const obstacleLeft = obstacleRect.x;
                        const characterWidth = characterRect.width;
                        const obstacleWidth = obstacleRect.width;

                        // set character left position to the left of the obstacle
                        if (characterLeft < obstacleLeft) {
                          character.style.left = `${obstacleLeft - characterWidth}px`;
                        } else {
                          character.style.left = `${obstacleLeft + obstacleWidth}px`;
                        }

                        // add .map-objhect to .character-container
                        // character.classList.add('map-object');

                        timeCharacterWasDamanged = currentTime;

                        game.resetPointsMultiplier();
                      }
                    }
                  }
                  break;
                case MapObjectTypeEnum.TRIGGER:
                  // check if obstacle is in hitbox
                  if (
                    hitBoxRect.x + hitBoxRect.width > elementRect.x &&
                    hitBoxRect.x < elementRect.x + elementRect.width &&
                    hitBoxRect.y + hitBoxRect.height > elementRect.y &&
                    hitBoxRect.y < elementRect.y + elementRect.height
                  ) {
                    const collided = game.collideWith(mapObject);
                    if (collided) {
                      setCrashed(true);
                      element.style.left = `${elementRect.x + 50}px`;
                      element.style.transition = 'all 0s';
                      element.style.animationDuration = '0.3s';
                      element.classList.remove('map-object');
                      element.classList.add('animate__animated', 'animate__shakeY');

                      triggerColor(mapObject.color!);
                    }
                  }
                  break;
              }
            }

            if (elementRect.x + elementRect.width < 0) {
              mapObjects.delete(mapObject.id);

              setMapObjects(new Map(mapObjects));
              try {
                // delete element from document
                sceneRef.current?.removeChild(element);
              } catch (e) {
                // ignore
              }
            }
          }
        });
      }

      if (bgmAudio) {
        bgmAudio.muted = game.audio.muted;

        if (game.state !== ArcadeGameStateEnum.GAME_OVER) {
          if (bgmAudio.paused) {
            bgmAudio.volume = 0.15;
            bgmAudio.currentTime = 0;
            bgmAudio.play();
          }
        } else {
          if (!bgmAudio.paused) {
            bgmAudio.pause();
          }
        }
      }

      if (gomAudio) {
        gomAudio.muted = game.audio.muted;

        if (game.state === ArcadeGameStateEnum.GAME_OVER) {
          if (gomAudio.paused) {
            gomAudio.volume = 0.15;
            gomAudio.currentTime = 0;
            gomAudio.play();
          }
        } else {
          if (!gomAudio.paused) {
            gomAudio.pause();
          }
        }
      }

      requestAnimationFrame(update);
    };

    const frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

  const spawnObstacleIfPossible = () => {
    const canSpawnObstacle = Date.now() > timeTillNextObstacleSpawnRef.current;

    if (canSpawnObstacle && game.state === ArcadeGameStateEnum.PLAYING) {
      const pixleSize = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
      );

      setMapObjects((prev) => {
        const newObjects = new Map<string, MapObject>(prev);
        const obstacle = new MapObject(MapObjectTypeEnum.OBSTACLE);
        obstacle.x = 100;

        // const maxWidth = possibleWidths[Math.floor(Math.random() * possibleWidths.length)];

        obstacle.width = 64;

        obstacle.speed = game.speed * 5;

        // let offset = 0;

        // obstacle.children = [0, 0, 0].map((_, i) => {
        //   const point = new MapObject(MapObjectTypeEnum.TRIGGER);
        //   point.parentID = obstacle.id;
        //   point.x = 100;
        //   point.offsetX = ((obstacle.width + 20) * pixleSize) / 2 + offset * pixleSize;
        //   point.width = 9 * (3 / (i + 1));
        //   point.height = 4;
        //   point.speed = obstacle.speed;
        //   point.value = [1, 5, 10][i];
        //   point.color = [
        //     ArcadeGameColorEnum.BLUE,
        //     ArcadeGameColorEnum.YELLOW,
        //     ArcadeGameColorEnum.RED
        //   ][i];

        //   offset += point.width + 1;

        //   newObjects.set(point.id, point);

        //   return point;
        // });

        newObjects.set(obstacle.id, obstacle);

        return newObjects;
      });

      timeTillNextObstacleSpawnRef.current = Date.now() + 1000 * game.spawnObstacleSpeed;
    }
  };

  const spawnItemIfPossible = () => {
    const canSpawnHealth = Date.now() > timeTillNextItemSpawnRef.current;

    if (canSpawnHealth && game.state === ArcadeGameStateEnum.PLAYING) {
      const random = Math.random();

      const items = [MapItemTypeEnum.HEALTH, ...new Array(4).fill(MapItemTypeEnum.BONUS)];

      const chances = [
        ...new Array(100 - game.itemChance).fill(0),
        ...new Array(game.itemChance).fill(1)
      ];

      const spawn = chances[Math.floor(random * chances.length)];

      if (spawn) {
        const item = items[Math.floor(Math.random() * items.length)];

        setMapObjects((prev) => {
          const newObjects = new Map<string, MapObject>(prev);
          const newObject = new MapObject(MapObjectTypeEnum.ITEM);
          newObject.itemType = item;
          newObject.y = Math.floor(Math.random() * (70 - 55) + 55);
          newObject.speedInSec = 15;
          newObject.width = 16;
          newObject.height = 16;

          newObject.color = possibleColors[Math.floor(Math.random() * possibleColors.length)];

          if (item === MapItemTypeEnum.BONUS) {
            const possibleValues = [...new Array(6).fill(2), ...new Array(3).fill(5), 10];
            newObject.value = possibleValues[Math.floor(Math.random() * possibleValues.length)];
          }

          newObjects.set(newObject.id, newObject);

          return newObjects;
        });
      }

      timeTillNextItemSpawnRef.current = Date.now() + 1000 * game.spawnItemSpeed;
    }
  };

  const spawnCloudIfPossible = () => {
    const canSpawnCloud = Date.now() > timeTillNextCloudSpawnRef.current;

    if (canSpawnCloud) {
      const chances = [
        ...new Array(100 - game.cloudChance).fill(0),
        ...new Array(game.cloudChance).fill(1)
      ];

      const spawn = chances[Math.floor(Math.random() * chances.length)];

      if (spawn) {
        setMapObjects((prev) => {
          const newObjects = new Map<string, MapObject>(prev);
          const newObject = new MapObject(MapObjectTypeEnum.CLOUD);
          newObject.x = 100;
          newObject.y = Math.floor(Math.random() * (75 - 0) + 0);

          const size = Math.floor(Math.random() * (3 - 1) + 1);

          newObject.width = 16 * size;
          newObject.height = 8 * size;

          newObject.speed = random(10, 15) * (3 / size);

          newObject.value = Math.floor(Math.random() * (2 - 0) + 0);

          newObjects.set(newObject.id, newObject);
          return newObjects;
        });
      }

      timeTillNextCloudSpawnRef.current = Date.now() + 1000 * game.spawnCloudSpeed;
    }
  };

  const startGame = () => {
    if (loading) return;

    setLoading(true);
    timeTillNextItemSpawnRef.current = Date.now() + 1000 * game.spawnItemSpeed;
    timeTillNextObstacleSpawnRef.current = Date.now() + 1000 * game.spawnObstacleSpeed;

    game.jumpCount = 0;
    game.canJump = true;

    game.start();

    //  set default character position based on character ref
    const character = characterRef.current;
    if (character) {
      game.defaultFloorPosition.x = character.offsetLeft;
      game.defaultFloorPosition.y = character.offsetTop;
    }

    setLoading(false);
  };

  const jump = () => {
    if (!game.canJump) return;
    setIsJumping(false);

    if (characterJumpRef.current) {
      characterJumpRef.current.pause();
    }

    if (characterFallRef.current) {
      characterFallRef.current.pause();
    }

    const pixleSize = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
    );

    let jumpHeight = -1 * Math.abs(game.jumpHeight * 50 * pixleSize);
    const jumpSpeed = game.jumpSpeed * 200;

    const character = characterRef.current;
    const camera = cameraRef.current;

    if (character && camera) {
      const characterRec = character.getBoundingClientRect();

      const cameraPosition = {
        y: camera.offsetTop
      };

      if (characterJumpRef.current) {
        jumpHeight += parseFloat(
          characterJumpRef.current.animatables[0].target.style.transform.replace('translateY(', '')
        );
      }

      characterJumpRef.current = anime({
        targets: character,
        translateY: jumpHeight,
        duration: jumpSpeed,
        easing: 'linear',
        begin: () => {
          setIsJumping(true);

          game.jumpCount++;

          if (game.jumpCount >= game.maxJumpCount) {
            game.canJump = false;
          }
        },
        complete: () => {
          characterFallRef.current = anime({
            targets: character,
            translateY: cameraPosition.y,
            duration: jumpSpeed,
            easing: 'linear',
            // begin: () => {},
            complete: () => {
              // wait for cooldown before allowing jump again
              setIsJumping(false);
              setTimeout(() => {
                game.jumpCount = 0;
                game.canJump = true;
              }, game.jumpCooldown * 100);
            }
          });
        }
      });
    }
  };

  const restartGame = () => {
    setMapObjects(new Map<string, MapObject>());
    game.reset();
    game.start();
  };

  const tap = () => {
    switch (game.state) {
      case ArcadeGameStateEnum.PLAYING:
        jump();
        break;
      case ArcadeGameStateEnum.STARTING:
        // delete all obstacles and triggers
        startGame();
        break;
      case ArcadeGameStateEnum.PAUSED:
        game.resume();
        break;
    }
  };

  if (loading) return null;

  return (
    <>
      <div className={`scene relative w-full h-full overflow-hidden`} ref={sceneRef}>
        <audio ref={audioBGMRef} src={game.bgm} loop muted></audio>
        <audio ref={audioGOMRef} src={game.gameOverBgm} loop muted></audio>
        <ArcadeGameSoundController
          game={game}
          jumped={isJumping}
          crashed={crashed}
          started={game.state == ArcadeGameStateEnum.PLAYING}
        />
        <div className="objects absolute top-0 left-0 right-0 z-10 h-full bg-blue-400">
          <div
            className="absolute bottom-0 left-0 right-0 z-10 bg-green-600 border-green-400"
            style={{
              height: 'calc(60px * var(--pixel-size))',
              borderTopWidth: 'calc(4px * var(--pixel-size))'
            }}></div>
          <div
            className="absolute bottom-0 left-0 right-0 z-10 bg-yellow-700"
            style={{ height: 'calc(45px * var(--pixel-size))' }}></div>
          <div
            className="absolute bottom-0 left-0 right-0 z-10 bg-blue-600/75 border-t-4 border-blue-100"
            style={{ height: 'calc(15px * var(--pixel-size))' }}></div>
          <div
            className="relative z-20 w-full h-full"
            style={{ paddingBottom: 'calc(60px * var(--pixel-size))' }}>
            <div className="relative w-full h-full">
              <div className="clouds absolute inset-0 overflow-hidden pb-4">
                <div className="relative w-full h-full">
                  {Array.from(mapObjects.values()).map((mapObject) => {
                    if (mapObject.type == MapObjectTypeEnum.CLOUD) {
                      return (
                        <div
                          key={mapObject.id}
                          id={mapObject.id}
                          title={`speed-dampening: ${speedDampening}`}
                          className="absolute animated-object map-object cloud"
                          style={{
                            top: `calc(${mapObject.y}% + ${mapObject.offsetY ?? 0}px)`,
                            left: `calc(${mapObject.x}% + ${
                              mapObject.offsetX ?? 0
                            }px * var(--pixel-size))`,
                            animationDuration: `${mapObject.speed * speedDampening}s`
                          }}>
                          <Sprite
                            id={mapObject.id}
                            row={mapObject.value}
                            frames={1}
                            width={32}
                            height={64}
                            sheet={{
                              className: 'cloud',
                              image: 'sky/clouds'
                            }}
                          />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
              <div className="obstacles absolute inset-0">
                {Array.from(mapObjects.values()).map((mapObject) => {
                  if (mapObject.type == MapObjectTypeEnum.OBSTACLE) {
                    return (
                      <div
                        key={mapObject.id}
                        id={mapObject.id}
                        title={`speed-dampening: ${speedDampening}`}
                        className="absolute animated-object map-object flex items-end"
                        style={{
                          top: '100%',
                          left: `calc(${mapObject.x}% + ${
                            mapObject.offsetX ?? 0
                          }px * var(--pixel-size))`,
                          paddingLeft: `calc(${mapObject.width}px * var(--pixel-size))`,
                          animationDuration: `${mapObject.speed * speedDampening}s`
                        }}>
                        <div
                          className="border-4 border-green-500"
                          style={{
                            left: '100%',
                            ...CSSDimensionsWithPixelSize(
                              `${10 * (mapObject.width / 16)}px`,
                              `20px`
                            )
                          }}></div>
                        <div
                          key={mapObject.id}
                          title={`speed-dampening: ${speedDampening}`}
                          className="absolute left-0 top-0 flex items-end bg-blue-400 border-b-4 border-blue-600"
                          style={{
                            ...CSSDimensionsWithPixelSize(`${mapObject.width}px`, `60px`)
                          }}>
                          <div
                            className="absolute w-full m-auto"
                            style={{
                              bottom: '100%',
                              height: `calc(20px * var(--pixel-size))`,
                              padding: `0px calc(6px * var(--pixel-size))`
                            }}>
                            <div className="obstacle w-full h-full bg-white border-2 border-black"></div>
                          </div>

                          <div
                            className="absolute bottom-0 left-0 right-0 z-10 bg-blue-600"
                            style={{ height: 'calc(15px * var(--pixel-size))' }}></div>
                          <div
                            className="absolute top-0  left-0 z-10 bg-green-600 border-green-400 rounded-tr-md"
                            style={{
                              width: 'calc(2px * var(--pixel-size))',
                              height: 'calc(15px * var(--pixel-size))',
                              borderTopWidth: 'calc(4px * var(--pixel-size))'
                            }}></div>
                          <div
                            className="absolute top-0  right-0 z-10 bg-green-600 border-green-400 rounded-tl-md"
                            style={{
                              width: 'calc(2px * var(--pixel-size))',
                              height: 'calc(15px * var(--pixel-size))',
                              borderTopWidth: 'calc(4px * var(--pixel-size))'
                            }}>
                            {mapObject.children.map((child) => {
                              return (
                                <Trigger
                                  key={child.id}
                                  id={child.id}
                                  width={child.width}
                                  color={child.color}
                                  value={child.value}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
              <div className="items absolute z-0 inset-0">
                {Array.from(mapObjects.values()).map((mapObject) => {
                  if (mapObject.type == MapObjectTypeEnum.ITEM) {
                    return (
                      <div
                        key={mapObject.id}
                        id={mapObject.id}
                        title={`speed-dampening: ${speedDampening}`}
                        className={`absolute animated-object map-object item trigger-${mapObject.color} bg-${mapObject.color}-500 border-2 border-black rounded-lg p-4`}
                        style={{
                          top: `calc(${mapObject.y}% + ${mapObject.offsetY ?? 0}px)`,
                          animationDuration: `${mapObject.speedInSec}s`,
                          ...CSSDimensionsWithPixelSize(
                            `${mapObject.width}px`,
                            `${mapObject.height}px`
                          )
                        }}>
                        <div
                          className={`w-full h-full flex items-center justify-center text-white font-black drop-shadow-lg`}>
                          <div style={{ fontSize: 'calc(8px * var(--pixel-size))' }}>
                            {mapObject.itemType == MapItemTypeEnum.HEALTH && (
                              <Icon name="HeartSolid" />
                            )}
                            {mapObject.itemType == MapItemTypeEnum.BONUS && `x${mapObject.value}`}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
              <div
                className="camera relative w-full h-full text-white font-black text-xl"
                ref={cameraRef}>
                <div className="player w-full h-full flex justify-center items-end">
                  <div
                    className={`character-container animate__animated ${
                      game.state == ArcadeGameStateEnum.GAME_OVER ? 'dead' : ''
                    } absolute z-10`}
                    ref={characterRef}>
                    <div className="absolute inset-0 flex justify-center items-end">
                      <div
                        className="hit-box"
                        style={{ ...CSSDimensionsWithPixelSize('8px', '24px') }}
                        ref={hitBoxRef}></div>
                    </div>
                    <Character
                      id="character"
                      width={32}
                      height={42}
                      outfit={outfit?.code}
                      facingDirection={
                        game.state !== ArcadeGameStateEnum.GAME_OVER
                          ? CharacterFacingDirectionEnum.RIGHT
                          : CharacterFacingDirectionEnum.DOWN
                      }
                      isMoving={game.state == ArcadeGameStateEnum.PLAYING}
                      isJumping={isJumping}
                      isFocused={game.mods.invincible}
                    />
                  </div>
                  {game.state == ArcadeGameStateEnum.GAME_OVER && (
                    <div className="character-container absolute z-10 animate__animated animate__fadeOutUp opacity-25">
                      <Character
                        id="dead-character"
                        width={32}
                        height={42}
                        outfit={outfit?.code}
                        facingDirection={CharacterFacingDirectionEnum.DOWN}
                        isMoving={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* overlay */}
        <div className="absolute overlay hidden animate__animated inset-0 z-10 bg-indigo-700/50 backdrop-blur-smx"></div>

        <div
          className="absolute z-20 inset-0 flex justify-center items-start pt-8 text-white font-black text-5xl"
          onClick={() => tap()}>
          {game.state !== ArcadeGameStateEnum.STARTING && (
            <>
              <div className="text-center">
                <div className="tracking-widest mb-2">
                  {padStart(`${Math.floor(game.feet) ?? 0}`, 4, '0')}
                </div>
                <div className="text-sm font-semibold">SCORE</div>
              </div>

              <div className="absolute left-0 bottom-0 w-full h-1/4 flex items-center justify-start p-4">
                {game.mods.pointsMultiplier.timeout > 0 && (
                  <div className="md:w-1/6 md:p-8 flex flex-wrap justify-center">
                    <div
                      className={`w-full flex justify-center mb-2 drop-shadow-lg text-${game.mods.pointsMultiplier.color}-500`}
                      style={{
                        fontSize: 'calc(12px * var(--pixel-size))'
                      }}>
                      <div>
                        <>
                          <span
                            style={{
                              fontSize: 'calc(10px * var(--pixel-size))'
                            }}>
                            x
                          </span>
                          {game.mods.pointsMultiplier.amount}
                        </>
                      </div>
                    </div>
                    <div className="w-full h-[10px] md:px-12">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <CoolDown
                          complete={() => {
                            console.log('points multiplier timeout');
                            game.resetPointsMultiplier();
                          }}
                          bgColor={`bg-gray-600/25`}
                          barColor={`bg-${game.mods.pointsMultiplier.color}-500 rounded-full`}
                          time={game.mods.pointsMultiplier.timeout}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div
          className="absolute z-30 inset-0 bottom-[15%] flex justify-center items-center text-white font-black text-xl"
          onClick={() => tap()}>
          {game.state === ArcadeGameStateEnum.GAME_OVER && (
            <div className="text-center">
              <div className="text-yellow mb-2">GAME OVER</div>
              <div className="grid grid-rows-1 gap-x-2">
                {quit && (
                  <div
                    className="text-sm font-semibold btn bg-red-400 border-2 border-red-600"
                    onClick={() => quit()}>
                    Quit
                  </div>
                )}
                <div
                  className="text-sm font-semibold btn bg-green-400 border-2 border-green-600"
                  onClick={() => restartGame()}>
                  Restart
                </div>
              </div>
            </div>
          )}
        </div>

        {game.state !== ArcadeGameStateEnum.STARTING && (
          <div className="absolute z-30 right-0 p-2 lives flex flex-row-reverse">
            {Array.from({ length: game.maxLives ?? 0 }).map((_, i) => (
              <div key={i} className="relative flex justify-center items-center w-[32px] h-[32px]">
                {game.lives > i ? (
                  <Icon name="HeartSolid" className="text-xl text-red" />
                ) : (
                  <Icon name="HeartSolid" className="text-xl text-black" />
                )}
              </div>
            ))}
          </div>
        )}

        {game.state !== ArcadeGameStateEnum.GAME_OVER &&
          game.state !== ArcadeGameStateEnum.STARTING && (
            <div className="absolute z-30 bottom-0 right-0 flex">
              <div className="p-4">
                <div
                  className="bg-white rounded-lg outline outline-b-4 outline-gray-500 p-2 px-3 text-black opacity-25 hover:opacity-100 active:opacity-100 active:outline-0 cursor-pointer"
                  onClick={() => game.togglePause()}>
                  <Icon name={game.state == ArcadeGameStateEnum.PLAYING ? 'pause' : 'resume'} />
                </div>
              </div>
              <div className="p-4">
                <div
                  className="bg-white rounded-lg outline outline-b-4 outline-gray-500 p-2 px-3 text-black opacity-25 hover:opacity-100 active:opacity-100 active:outline-0 cursor-pointer"
                  onClick={() => game.toggleMute()}>
                  <Icon name={!game.audio.muted ? 'mute' : 'unmute'} />
                </div>
              </div>
            </div>
          )}

        {game.state == ArcadeGameStateEnum.STARTING && (
          <div
            className="fixed bg-gray-500/75 inset-0 flex flex-wrap items-center text-left font-semibold"
            style={{ zIndex: 1000 }}>
            <div className="w-full flex flex-wrap justify-center">
              <div className="w-full p-4 flex justify-center">
                <div className="md:w-1/4 max-w-[80vw] max-h-[54vh] overflow-auto flex flex-wrap items-center p-4 bg-white border-2 border-black text-black/75 tracking-wide rounded-lg">
                  <div className="w-full text-left">Welcome</div>
                  <div className="w-full p-2 text-xs text-lighter">
                    Get ready for an adrenaline rush with{' '}
                    <span className="text-blue-700">Tapgate</span>! Test your reflexes and show off
                    your skills by soaring over obstacles that get faster and faster the longer you
                    play. Collect health and points on your journey to see how far you can go. So,
                    what are you waiting for? Put your game face on and let's see how far you can
                    soar! Good luck, challenger!
                  </div>
                  <div className="w-full text-left">Controls</div>
                  <div className="w-full p-2 text-xs text-lighter">
                    <div className="w-full mb-2">
                      <span className="md:hidden">Tap</span>{' '}
                      <span className="hidden md:inline">Click</span> the screen{' '}
                      <span className="hidden md:inline">
                        or hit the <span className="text-purple-500">spacebar</span>
                      </span>{' '}
                      to jump over hurdles.
                    </div>
                  </div>
                  <div className="w-full text-left">Support</div>
                  <div className="w-full p-2 text-xs text-lighter">
                    You can help support us in the following ways:
                    <ul className="list-decimal p-2 px-6 flex flex-wrap gap-y-2">
                      <li>
                        Donating <span className="text-red-500">OMI</span> or your favorite
                        cryptocurrency / NFT to QR bellow
                      </li>
                      <li>
                        Following us on{' '}
                        <a
                          className="text-blue-500 underline"
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
              </div>
              <div
                className="w-1/2 md:w-1/5 text-lg md:text-5xl font-semibold text-center p-2 md:p-4 bg-green-400 text-white rounded-lg border-2 border-green-600 cursor-pointer hover:opacity-75 active:opacity-50"
                onClick={() => tap()}>
                PLAY
              </div>
            </div>
          </div>
        )}
      </div>
    </>
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
