import { padStart } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import uuid from 'react-uuid';
import useSound from 'use-sound';
import Character, { CharacterFacingDirectionEnum } from '../../../../../components/character';
import { Icon } from '../../../../../components/icons';
import MobileView from '../../../../../components/mobile-view';
import { useGame } from '../../../../../context/game';
import { useUser } from '../../../../../context/user';
import { IItem } from '../../../../../models/item';
import { IGameData } from '../../../../../utils/game';
import { CSSDimensionsWithPixelSize } from '../../../../../utils/pixles';

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

enum IMapObjectTypeEnum {
  CLOUD = 'cloud',
  OBSTACLE = 'obstacle',
  HEALTH = 'health',
  POINT = 'point'
}

class MapObject {
  public id = '';
  public x?: number = 0;
  public y?: number = 0;
  public speed = 1;
  public width = 0;
  public height = 0;
  public type!: IMapObjectTypeEnum;
  public value: any;

  public parentID?: string;
  public children: MapObject[] = [];

  constructor(type: IMapObjectTypeEnum) {
    this.id = uuid();
    this.type = type;
  }
}

interface IArcadeAudio {
  muted: boolean;
  volume: number;
}

class ArcadeGameMode {
  public state = ArcadeGameStateEnum.STARTING;

  public speed = 1;
  public maxJumps = 2;
  public maxLives = 3;
  public lives = 3;
  public jumpHeight = 40;
  public jumpSpeed = 1;
  public jumpHangTime = 0.5;
  public feet = 0;
  public jumpCount = 0;

  public spawnTileSpeed = 100;
  public spawnTileCount = 5;

  public spawnObstacleSpeed = 5;
  public spawnHealthSpeed = 10;
  public spawnCloudSpeed = 1;

  public startingTileCount = 10;
  public maxTileCount = 20;
  public maxHealthCount = 1;
  public maxObstacleCount = 5;
  public maxCloudCount = 25;

  public mapLeftPadding = 150;
  public tileWidth = 16;
  public tileHeight = 150;

  public cloudChance = 0.5;
  public obstacleChance = 0.1;
  public healthChance = 0.05;

  public audio: IArcadeAudio = {
    muted: false,
    volume: 100
  };

  public objectsHit: { [key: string]: boolean } = {};

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

  collideWithObject(object: MapObject): boolean {
    if (object.parentID) {
      if (this.objectsHit[object.parentID]) {
        return false;
      }
    }

    if (!this.objectsHit[object.id]) {
      this.objectsHit[object.id] = true;

      if (object.parentID) {
        this.objectsHit[object.parentID] = true;
      }

      if (object.type === IMapObjectTypeEnum.OBSTACLE) {
        this.takeLife();
      } else if (object.type === IMapObjectTypeEnum.HEALTH) {
        this.jumpCount--;
        if (this.jumpCount < 0) {
          this.jumpCount = 0;
        }
        this.giveLife();
      } else if (object.type === IMapObjectTypeEnum.POINT) {
        this.feet += object.value;
      }

      return true;
    }

    return false;
  }

  takeLife() {
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
    this.objectsHit = {};
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
  gameMode: ArcadeGameMode;
  started?: boolean;
  jumped?: boolean;
  crashed?: boolean;
}

const ArcadeGameSoundController = ({
  gameMode,
  jumped,
  crashed
}: IArcadeGameSoundControllerProps) => {
  const [playJumpSfx] = useSound(gameMode.jumpSfx, {
    volume: (gameMode.audio.volume / 100) * 0.1,
    interrupt: true
  });
  const [playCrashSfx] = useSound(gameMode.crashSfx, {
    volume: (gameMode.audio.volume / 100) * 0.1,
    interrupt: true
  });

  useEffect(() => {
    if (jumped && !gameMode.audio.muted) {
      playJumpSfx();
    }
  }, [jumped]);

  useEffect(() => {
    if (crashed && !gameMode.audio.muted) {
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
  const [gameMode] = useState<ArcadeGameMode>(new ArcadeGameMode());
  const [loading, setLoading] = useState<boolean>(false);

  const [mapObjects, setMapObjects] = useState<Map<string, MapObject>>(
    new Map<string, MapObject>([])
  );
  const [mapObjectTypeCounts, setMapObjectTypeCounts] = useState<Map<IMapObjectTypeEnum, number>>(
    new Map<IMapObjectTypeEnum, number>([])
  );

  const [speedDampening, setSpeedDampening] = useState<number>(1);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [crashed, setCrashed] = useState<boolean>(false);

  const sceneRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);
  const timeTillNextObstacleSpawnRef = useRef<number>(
    Date.now() + 1000 * gameMode.spawnObstacleSpeed
  );
  const timeTillNextHealthSpawnRef = useRef<number>(Date.now() + 1000 * gameMode.spawnHealthSpeed);
  const timeTillNextCloudSpawnRef = useRef<number>(Date.now() + 1000 * gameMode.spawnCloudSpeed);
  const jumpAreaRef = useRef<HTMLDivElement>(null);

  const characterRef = useRef<HTMLDivElement>(null);
  const hitBoxRef = useRef<HTMLDivElement>(null);
  const audioBGMRef = useRef<HTMLAudioElement>(null);
  const audioGOMRef = useRef<HTMLAudioElement>(null);

  const mapObjectsRef = useRef<Map<string, MapObject>>(mapObjects);

  const jumpingFrameRef = useRef<number>(0);

  useEffect(() => {
    gameMode.updateData(data);
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
    setMapObjectTypeCounts((prev) => {
      const newMap = new Map<IMapObjectTypeEnum, number>([]);
      mapObjects.forEach((mapObject) => {
        const count = newMap.get(mapObject.type);
        newMap.set(mapObject.type, count ? count + 1 : 1);
      });
      return newMap;
    });
    mapObjectsRef.current = mapObjects;
  }, [mapObjects]);

  useEffect(() => {
    if (gameMode.lives <= 0) return;

    // on spacebar press jump
    const keyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        jump();
      }
    };

    window.addEventListener('keydown', keyDown);

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
      const speedDampening = 1 / windowSizePercentage;
      setSpeedDampening(speedDampening);
    };

    resize();

    window.addEventListener('resize', resize);

    let timeStamp = Date.now();
    let timeCharacterWasDamanged = 0;

    const update = () => {
      const bgmAudio = audioBGMRef.current;
      const gomAudio = audioGOMRef.current;

      const currentTime = Date.now();
      const timeDelta = currentTime - timeStamp;
      timeStamp = currentTime;

      const mapObjects = mapObjectsRef.current;

      spawnCloudIfPossible();

      if (gameMode.state !== ArcadeGameStateEnum.PLAYING) {
        // get overlay element
        const overlay = document.querySelector('.overlay') as HTMLElement;
        overlay.classList.remove('animate__fadeOut');
        overlay.classList.add('animate__fadeIn');
      } else {
        // get overlay element
        const overlay = document.querySelector('.overlay') as HTMLElement;
        overlay.classList.remove('animate__fadeIn');
        overlay.classList.add('animate__fadeOut');
      }

      if ([ArcadeGameStateEnum.GAME_OVER, ArcadeGameStateEnum.PAUSED].includes(gameMode.state)) {
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

      if (gameMode.state !== ArcadeGameStateEnum.GAME_OVER) {
        if (gameMode.state === ArcadeGameStateEnum.PLAYING) {
          spawnObstacleIfPossible();
          spawnHealthIfPossible();
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
                case IMapObjectTypeEnum.OBSTACLE:
                  // check if obstacle is in hitbox
                  if (
                    hitBoxRect.x + hitBoxRect.width > elementRect.x &&
                    hitBoxRect.x < elementRect.x + elementRect.width &&
                    hitBoxRect.y + hitBoxRect.height > elementRect.y &&
                    hitBoxRect.y < elementRect.y + elementRect.height
                  ) {
                    const collided = gameMode.collideWithObject(mapObject);
                    if (collided) {
                      setCrashed(true);
                      element.style.left = `${elementRect.x + 50}px`;
                      element.style.transition = 'all 0s';
                      element.style.animationDuration = '0.3s';
                      element.classList.remove('map-object');
                      element.classList.add('animate__animated', 'animate__rotateOutUpRight');
                      character.classList.add('animate__flash');
                      character.style.animationDuration = '0.3s';
                      timeCharacterWasDamanged = currentTime;
                    }
                  }
                  break;
                case IMapObjectTypeEnum.POINT:
                  // check if obstacle is in hitbox
                  if (
                    hitBoxRect.x + hitBoxRect.width > elementRect.x &&
                    hitBoxRect.x < elementRect.x + elementRect.width &&
                    hitBoxRect.y + hitBoxRect.height > elementRect.y &&
                    hitBoxRect.y < elementRect.y + elementRect.height
                  ) {
                    const collided = gameMode.collideWithObject(mapObject);
                    if (collided) {
                      setCrashed(true);
                      element.style.left = `${elementRect.x + 50}px`;
                      element.style.transition = 'all 0s';
                      element.style.animationDuration = '0.3s';
                      element.classList.remove('map-object');
                      element.classList.add('animate__animated', 'animate__rotateOutUp');
                    }
                  }
                  break;
                case IMapObjectTypeEnum.HEALTH:
                  if (
                    hitBoxRect.x + hitBoxRect.width > elementRect.x &&
                    hitBoxRect.x < elementRect.x + elementRect.width &&
                    hitBoxRect.y + hitBoxRect.height > elementRect.y &&
                    hitBoxRect.y < elementRect.y + elementRect.height
                  ) {
                    const collided = gameMode.collideWithObject(mapObject);

                    if (collided) {
                      setCrashed(true);
                      element.style.left = `${elementRect.x - hitBoxRect.width / 2}px`;
                      element.style.transition = 'all 0s';
                      element.style.animationDuration = '0.3s';
                      element.classList.remove('map-object');
                      element.classList.add('animate__animated', 'animate__flipOutX');
                      character.classList.add('animate__flash');
                    }
                  }
                  break;
              }
            }

            if (elementRect.x + elementRect.width < 0) {
              mapObjects.delete(mapObject.id);
            }
          }
        });
      }

      if (bgmAudio) {
        bgmAudio.muted = gameMode.audio.muted;

        if (gameMode.state !== ArcadeGameStateEnum.GAME_OVER) {
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
        gomAudio.muted = gameMode.audio.muted;

        if (gameMode.state === ArcadeGameStateEnum.GAME_OVER) {
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
    };
  }, []);

  const spawnObstacleIfPossible = () => {
    const canSpawnObstacle = Date.now() > timeTillNextObstacleSpawnRef.current;

    if (canSpawnObstacle && gameMode.state === ArcadeGameStateEnum.PLAYING) {
      const random = Math.random();

      const spawn =
        random < gameMode.obstacleChance &&
        (mapObjectTypeCounts?.get(IMapObjectTypeEnum.OBSTACLE) ?? 0) < gameMode.maxObstacleCount;

      console.log('spawnObstacleIfPossible', spawn);

      if (spawn) {
        setMapObjects((prev) => {
          const newObjects = new Map<string, MapObject>(prev);
          const obstacle = new MapObject(IMapObjectTypeEnum.OBSTACLE);
          obstacle.x = 100;
          obstacle.width = 4;
          obstacle.height = Math.floor(Math.random() * (16 - 4) + 4);

          obstacle.speed = gameMode.speed * 10;

          obstacle.children = [0, 0, 0].map((_, i) => {
            const point = new MapObject(IMapObjectTypeEnum.POINT);
            point.parentID = obstacle.id;
            point.x = 100;
            point.width = obstacle.height * (i + 1 / 1) + 4;
            point.height = 4;
            point.speed = obstacle.speed * 15;
            point.value = Math.floor(10 * (16 / obstacle.height) * (1 / (i + 1)));

            newObjects.set(point.id, point);

            return point;
          });

          newObjects.set(obstacle.id, obstacle);

          console.log('newObjects', newObjects);

          return newObjects;
        });

        timeTillNextObstacleSpawnRef.current = Date.now() + 1000 * gameMode.spawnObstacleSpeed;
      }
    }
  };

  const spawnHealthIfPossible = () => {
    const canSpawnHealth = Date.now() > timeTillNextHealthSpawnRef.current;

    if (canSpawnHealth && gameMode.state === ArcadeGameStateEnum.PLAYING) {
      const random = Math.random();

      const spawn =
        random < gameMode.healthChance &&
        (mapObjectTypeCounts?.get(IMapObjectTypeEnum.HEALTH) ?? 0) < gameMode.maxHealthCount;

      console.log('spawnHealthIfPossible', spawn);

      if (spawn) {
        setMapObjects((prev) => {
          const newObjects = new Map<string, MapObject>(prev);
          const newObject = new MapObject(IMapObjectTypeEnum.HEALTH);
          newObject.y = Math.floor(Math.random() * (70 - 55) + 55);
          newObject.speed = gameMode.speed * 15;
          newObject.width = 16;
          newObject.height = 16;
          newObjects.set(newObject.id, newObject);
          return newObjects;
        });

        timeTillNextHealthSpawnRef.current = Date.now() + 1000 * gameMode.spawnHealthSpeed;
      }
    }
  };

  const spawnCloudIfPossible = () => {
    const canSpawnCloud = Date.now() > timeTillNextCloudSpawnRef.current;

    if (canSpawnCloud) {
      const random = Math.random();

      const spawn =
        random < gameMode.cloudChance &&
        (mapObjectTypeCounts?.get(IMapObjectTypeEnum.CLOUD) ?? 0) < gameMode.maxCloudCount;

      console.log('spawnCloudIfPossible', spawn);

      if (spawn) {
        setMapObjects((prev) => {
          const newObjects = new Map<string, MapObject>(prev);
          const newObject = new MapObject(IMapObjectTypeEnum.CLOUD);
          newObject.x = 100;
          newObject.y = Math.floor(Math.random() * (90 - 0) + 0);

          const size = Math.floor(Math.random() * (3 - 1) + 1);

          newObject.width = 16 * size;
          newObject.height = 8 * size;

          newObject.speed = Math.floor(Math.random() * (30 - 15) + 15) * (3 / size);

          newObjects.set(newObject.id, newObject);
          return newObjects;
        });

        timeTillNextCloudSpawnRef.current = Date.now() + 1000 * gameMode.spawnCloudSpeed;
      }
    }
  };

  const startGame = () => {
    if (loading) return;

    setLoading(true);
    gameMode.start();

    //  set default character position based on character ref
    const character = characterRef.current;
    if (character) {
      gameMode.defaultFloorPosition.x = character.offsetLeft;
      gameMode.defaultFloorPosition.y = character.offsetTop;
    }

    setLoading(false);
  };

  const jump = () => {
    const jumpingLimitReached = gameMode.jumpCount >= gameMode.maxJumps;

    if (jumpingLimitReached) return;

    if (jumpingFrameRef.current) {
      cancelAnimationFrame(jumpingFrameRef.current);
      setIsJumping(false);
    }

    gameMode.jumpCount++;

    setIsJumping(true);

    const character = characterRef.current;
    const jumpArea = jumpAreaRef.current;

    if (character && jumpArea) {
      const pixleSize = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
      );

      const jumpSpeed = gameMode.jumpSpeed * 15 * pixleSize;

      const currentTop =
        gameMode.jumpCount == 1 ? character.offsetTop : gameMode.currentFloorPosition.y;

      const jumpLimit = currentTop - gameMode.jumpHeight * pixleSize;

      let timeStamp = Date.now();

      const jump = () => {
        const now = Date.now();
        const deltaTime = now - timeStamp;
        timeStamp = now;

        const characterTop = character.offsetTop;

        if (characterTop > jumpLimit) {
          if (gameMode.state === ArcadeGameStateEnum.PLAYING) {
            character.style.top = `${characterTop - jumpSpeed * (deltaTime / 100)}px`;
          }

          // set current floor position
          gameMode.currentFloorPosition.y = character.offsetTop;
          jumpingFrameRef.current = requestAnimationFrame(jump);
        } else {
          fall();
        }
      };

      const fall = () => {
        const now = Date.now();
        const deltaTime = now - timeStamp;
        timeStamp = now;

        const characterTop = character.offsetTop;

        if (characterTop < gameMode.defaultFloorPosition.y) {
          if (gameMode.state === ArcadeGameStateEnum.PLAYING) {
            character.style.top = `${characterTop + jumpSpeed * (deltaTime / 100)}px`;
          }
          gameMode.currentFloorPosition.y = character.offsetTop;
          jumpingFrameRef.current = requestAnimationFrame(fall);
        } else {
          character.style.top = `${gameMode.defaultFloorPosition.y}px`;
          gameMode.jumpCount = 0;
          setIsJumping(false);
        }
      };

      jump();
    }
  };

  const restartGame = () => {
    gameMode.reset();
    gameMode.start();
  };

  const tap = () => {
    switch (gameMode.state) {
      case ArcadeGameStateEnum.PLAYING:
        jump();
        break;
      case ArcadeGameStateEnum.STARTING:
        startGame();
        break;
      case ArcadeGameStateEnum.PAUSED:
        gameMode.resume();
        break;
    }
  };

  if (loading) return null;

  return (
    <>
      <div className={`scene w-full h-full`} ref={sceneRef}>
        <audio ref={audioBGMRef} src={gameMode.bgm} loop muted></audio>
        <audio ref={audioGOMRef} src={gameMode.gameOverBgm} loop muted></audio>
        <ArcadeGameSoundController
          gameMode={gameMode}
          jumped={isJumping}
          crashed={crashed}
          started={gameMode.state == ArcadeGameStateEnum.PLAYING}
        />
        <div className="absolute top-0 left-0 right-0 z-10 h-[60%] bg-blue-300">
          <div className="absolute inset-0">
            {Array.from(mapObjects.values()).map((mapObject) => {
              if (mapObject.type == IMapObjectTypeEnum.CLOUD) {
                return (
                  <div
                    key={mapObject.id}
                    id={mapObject.id}
                    title={`speed-dampening: ${speedDampening}`}
                    className="absolute animated-object map-object cloud bg-white border-4 border-gray-500 border-b-8 rounded-lg opacity-75"
                    style={{
                      top: `${mapObject.y}%`,
                      left: `${mapObject.x}%`,
                      animationDuration: `${mapObject.speed * speedDampening}s`,
                      maxWidth: 'calc(8vw + 16px)',
                      maxHeight: 'calc(4vh + 8px)',
                      ...CSSDimensionsWithPixelSize(`${mapObject.width}px`, `${mapObject.height}px`)
                    }}></div>
                );
              }
            })}

            <div className="absolute inset-0 bg-cyan-500/25 backdrop-blur-sm"></div>
          </div>
          <div className="absolute inset-0">
            {Array.from(mapObjects.values()).map((mapObject) => {
              if (mapObject.type == IMapObjectTypeEnum.OBSTACLE) {
                return (
                  <div
                    key={mapObject.id}
                    title={`speed-dampening: ${speedDampening}`}
                    className="absolute animated-object map-object flex items-end opacity-75"
                    style={{
                      bottom: '0',
                      left: `${mapObject.x}%`,
                      animationDuration: `${mapObject.speed * (speedDampening * 1.25)}s`
                    }}>
                    <div
                      id={mapObject.id}
                      className="map-object obstacle bg-white border-b-8 rounded-t-lg"
                      style={{
                        ...CSSDimensionsWithPixelSize(
                          `${mapObject.width}px`,
                          `${mapObject.height}px`
                        )
                      }}></div>
                    {mapObject.children.map((child, i) => {
                      return (
                        <div
                          key={child.id}
                          id={child.id}
                          className={` map-object bonus-points 1 ${
                            ['bg-blue-500', 'bg-yellow-500', 'bg-red-500'][i]
                          } mx-1 rounded-md`}
                          style={{
                            ...CSSDimensionsWithPixelSize(`${child.width}px`, `${child.height}px`)
                          }}>
                          <div className="relative w-full h-full">
                            <div className="absolute bottom-[100%] w-full flex justify-center text-white text-xl">
                              {child.value}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
            })}
          </div>
          <div className="absolute inset-0">
            {Array.from(mapObjects.values()).map((mapObject) => {
              if (mapObject.type == IMapObjectTypeEnum.HEALTH) {
                return (
                  <div
                    key={mapObject.id}
                    id={mapObject.id}
                    title={`speed-dampening: ${speedDampening}`}
                    className="absolute animated-object map-object health bg-red-100 border-4 border-red rounded-lg opacity-75"
                    style={{
                      top: `${mapObject.y}%`,
                      animationDuration: `${mapObject.speed * (speedDampening * 2)}s`,
                      ...CSSDimensionsWithPixelSize(`${mapObject.width}px`, `${mapObject.height}px`)
                    }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div style={{ fontSize: '2em' }}>💯</div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
          <div
            className="relative w-full h-full flex justify-center items-end text-white font-black text-xl"
            ref={jumpAreaRef}>
            <div
              className={`character-container animate__animated ${
                gameMode.state == ArcadeGameStateEnum.GAME_OVER ? 'dead' : ''
              } absolute z-10 overflow-hidden`}
              ref={characterRef}>
              <div className="absolute inset-0 flex justify-center items-end">
                <div
                  className="hit-box border border-red-500"
                  style={{ ...CSSDimensionsWithPixelSize('8px', '24px') }}
                  ref={hitBoxRef}></div>
              </div>
              <Character
                width={32}
                height={42}
                outfit={outfit?.code}
                facingDirection={
                  gameMode.state !== ArcadeGameStateEnum.GAME_OVER
                    ? CharacterFacingDirectionEnum.RIGHT
                    : CharacterFacingDirectionEnum.DOWN
                }
                isMoving={gameMode.state == ArcadeGameStateEnum.PLAYING}
                isJumping={isJumping}
              />
            </div>
            {gameMode.state == ArcadeGameStateEnum.GAME_OVER && (
              <div className="character-container absolute z-10 overflow-hidden animate__animated animate__fadeOutUp opacity-25">
                <Character
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
        <div className="absolute bottom-0 left-0 right-0 z-10 h-[40%] bg-green-500 border-t-4 border-green-800"></div>
        <div className="absolute bottom-0 left-0 right-0 z-10 h-[25%] bg-yellow-500 border-t-4 border-yellow-800"></div>
        <div className="absolute bottom-0 left-0 right-0 z-10 h-[10%] bg-blue-500/75 border-t-4 border-blue-800/75"></div>

        {/* overlay */}
        <div className="absolute overlay animate__animated inset-0 z-10 bg-cyan-700/50 backdrop-blur-sm"></div>

        <div
          className="absolute z-20 inset-0 bottom-[50%] flex justify-center items-center text-white font-black text-5xl"
          onClick={() => tap()}>
          <div className="text-center">
            <div className="tracking-widest mb-2">
              {padStart(`${Math.floor(gameMode.feet) ?? 0}`, 4, '0')}
            </div>
            <div className="text-sm font-semibold">SCORE</div>
          </div>
        </div>
        <div
          className="absolute z-30 inset-0 bottom-[15%] flex justify-center items-center text-white font-black text-xl"
          onClick={() => tap()}>
          {gameMode.state !== ArcadeGameStateEnum.GAME_OVER ? (
            <div className="text-center">
              {gameMode.state == ArcadeGameStateEnum.STARTING && (
                <div className="text-indigo">TAP TO START</div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-yellow mb-2">GAME OVER</div>
              <div className="grid grid-rows-1 gap-x-2">
                {quit && (
                  <div
                    className="text-sm font-semibold btn bg-red-400 border-4 border-red-600"
                    onClick={() => quit()}>
                    Quit
                  </div>
                )}
                <div
                  className="text-sm font-semibold btn bg-green-400 border-4 border-green-600"
                  onClick={() => restartGame()}>
                  Restart
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute z-30 right-0 p-2 lives flex flex-row-reverse">
          {Array.from({ length: gameMode.maxLives ?? 0 }).map((_, i) => (
            <div key={i} className="relative flex justify-center items-center w-[32px] h-[32px]">
              {gameMode.lives > i ? (
                <Icon name="HeartSolid" className="text-xl text-red" />
              ) : (
                <Icon name="HeartSolid" className="text-xl text-black" />
              )}
            </div>
          ))}
        </div>
        {gameMode.state !== ArcadeGameStateEnum.GAME_OVER && (
          <div className="absolute z-30 top-0 left-0 flex">
            <div className="p-4">
              <div
                className="bg-white rounded-lg outline outline-b-4 outline-gray-500 p-2 px-3 text-black active:outline-0 cursor-pointer"
                onClick={() => gameMode.togglePause()}>
                <Icon name={gameMode.state == ArcadeGameStateEnum.PLAYING ? 'pause' : 'resume'} />
              </div>
            </div>
            <div className="p-4">
              <div
                className="bg-white rounded-lg outline outline-b-4 outline-gray-500 p-2 px-3 text-black active:outline-0 cursor-pointer"
                onClick={() => gameMode.toggleMute()}>
                <Icon name={!gameMode.audio.muted ? 'mute' : 'unmute'} />
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
