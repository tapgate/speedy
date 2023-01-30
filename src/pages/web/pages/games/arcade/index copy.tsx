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
import { CSSDimensionsWithPixelSize, CSSPositionPixelSize } from '../../../../../utils/pixles';

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

class ArcadeGameMode {
  public state = ArcadeGameStateEnum.STARTING;
  public speed = 1;
  public maxLives = 3;
  public lives = 3;
  public jumpHeight = 64;
  public jumpSpeed = 1.5;
  public jumpHangTime = 0.5;
  public feet = 0;
  public jumpCount = 0;

  public spawnTileSpeed = 100;
  public spawnTileCount = 5;

  public spawnObstacleSpeed = 1000;
  public spawnHealthSpeed = 1000;

  public startingTileCount = 10;
  public maxTileCount = 20;
  public maxHealthCount = 5;

  public mapLeftPadding = 150;
  public tileWidth = 16;
  public tileHeight = 150;

  public obstacleChance = 0.1;
  public healthChance = 0.05;

  public obstaclesHit: { [key: string]: boolean } = {};

  public healthHit: { [key: string]: boolean } = {};

  public jumpSfx = '/sounds/jump.mp3';

  public crashSfx = '/sounds/crash.mp3';

  public gameOverSfx = '/sounds/game-over.mp3';

  public bgm = '/music/eric-skiff-underclocked-no-copyright-8-bit-music-background.mp3';

  public gameOverBgm = '/music/monplaisir-soundtrack-no-copyright-8-bit-music.mp3';

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
}

interface IArcadeGameSoundControllerProps {
  gameMode: ArcadeGameMode;
  started?: boolean;
  jumped?: boolean;
  crashed?: boolean;
  gameOver?: boolean;
}

const ArcadeGameSoundController = ({
  gameMode,
  jumped,
  crashed,
  gameOver
}: IArcadeGameSoundControllerProps) => {
  const [playJumpSfx] = useSound(gameMode.jumpSfx, { volume: 0.25, interrupt: true });
  const [playCrashSfx] = useSound(gameMode.crashSfx, { volume: 0.25, interrupt: true });
  const [playGameOverSfx] = useSound(gameMode.gameOverSfx, { volume: 0.25, interrupt: true });
  const [playGameOverBgm, { stop: stopGameOverBgm }] = useSound(gameMode.gameOverBgm, {
    volume: 0.25,
    loop: true,
    interrupt: true
  });

  useEffect(() => {
    if (jumped) {
      playJumpSfx();
    }
  }, [jumped]);

  useEffect(() => {
    if (crashed) {
      playCrashSfx();
    }
  }, [crashed]);

  useEffect(() => {
    if (gameOver) {
      playGameOverSfx();
      playGameOverBgm();
    } else {
      stopGameOverBgm();
    }
  }, [gameOver]);

  return null;
};

export interface IArcadeGameProps {
  state?: ArcadeGameStateEnum;
  outfit?: IItem | null;
  data?: IGameData;
  quit?: () => void;
}

export const ArcadeGame = ({ state, outfit, data, quit }: IArcadeGameProps) => {
  const [gameMode, setGameMode] = useState<ArcadeGameMode>(new ArcadeGameMode());
  const [loading, setLoading] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Map<string, ITile>>(new Map<string, ITile>([]));
  const [firstTileId, setFirstTileId] = useState<string>(`tile-0`);
  const [lastTileId, setLastTileId] = useState<string>(`tile-${gameMode.startingTileCount - 1}`);
  const [tileIds, setTileIds] = useState<string[]>([]);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [crashed, setCrashed] = useState<boolean>(false);

  const gameModeRef = useRef<ArcadeGameMode>(gameMode);
  const mapRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);
  const firstTileIdRef = useRef<string>(firstTileId);
  const lastTileIdRef = useRef<string>(lastTileId);
  const tileIdsRef = useRef<string[]>(tileIds);
  const timeTillNextObstacleSpawnRef = useRef<number>(Date.now() + gameMode.spawnObstacleSpeed);
  const timeTillNextHealthSpawnRef = useRef<number>(Date.now() + gameMode.spawnHealthSpeed);
  const jumpAreaRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const hitBoxRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setGameMode((prev) => {
      if (state) {
        prev.state = state;
      }
      return prev;
    });
  }, [state]);

  useEffect(() => {
    setGameMode((prev) => {
      prev.updateData(data);
      return prev;
    });
  }, [data]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    firstTileIdRef.current = firstTileId;
  }, [firstTileId]);

  useEffect(() => {
    lastTileIdRef.current = lastTileId;
    spawnObstacleIfPossible();
    spawnHealthIfPossible();
  }, [lastTileId]);

  useEffect(() => {
    tileIdsRef.current = tileIds;
  }, [tileIds]);

  useEffect(() => {
    console.log('lives', gameMode.lives);
    gameModeRef.current = gameMode;
  }, [gameMode]);

  useEffect(() => {
    if (crashed) {
      setCrashed(false);
    }
  }, [crashed]);

  useEffect(() => {
    if (gameModeRef.current.lives <= 0) return;

    if (!loadingRef.current) {
      startGame();
    }

    let timeStamp = Date.now();
    let timeTillNextTileSpawn = timeStamp + gameMode.spawnTileSpeed;

    const update = () => {
      const gameMode = gameModeRef.current;
      const bgmAudio = audioRef.current;

      const currentTime = Date.now();
      const timeDelta = currentTime - timeStamp;
      timeStamp = currentTime;

      if (gameMode.state !== ArcadeGameStateEnum.GAME_OVER) {
        const pixleSize = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
        );

        const map = mapRef.current;
        const tileIds = tileIdsRef.current;

        if (map) {
          if (gameMode.state === ArcadeGameStateEnum.PLAYING) {
            gameModeRef.current.feet += gameMode.speed * 1.5 * (timeDelta / 1000);
          }

          setTiles((prev) => {
            const newTiles = new Map<string, ITile>(prev);

            for (let i = 0; i < tileIds.length; i++) {
              const tileId = tileIds[i];
              const tile = newTiles.get(tileId);

              if (tile) {
                tile.x -= gameMode.speed * 25 * 1.5 * (timeDelta / 1000);

                if (gameMode.state === ArcadeGameStateEnum.PLAYING) {
                  // check if tile touched character
                  const hitBox = hitBoxRef.current;
                  const obstacle = document.getElementById(tileId + '-obstacle');
                  const health = document.getElementById(tileId + '-health');

                  // add border to obstacle
                  // if (obstacle) {
                  //   obstacle.style.border = '5px solid red';
                  // }

                  if (hitBox && obstacle) {
                    if (!gameMode.obstaclesHit[tileId]) {
                      const hitBoxRect = hitBox.getBoundingClientRect();
                      const obstacleRect = obstacle.getBoundingClientRect();

                      if (
                        hitBoxRect.left < obstacleRect.right &&
                        hitBoxRect.right > obstacleRect.left &&
                        hitBoxRect.bottom > obstacleRect.top
                      ) {
                        gameMode.obstaclesHit[tileId] = true;
                        gameMode.lives--;

                        if (gameMode.lives <= 0) {
                          gameMode.state = ArcadeGameStateEnum.GAME_OVER;
                          gameMode.lives = 0;
                        }

                        // explode obstacle
                        if (obstacle) {
                          setCrashed(true);
                          obstacle.classList.add('animate__animated', 'animate__rotateOutUpRight');
                        }
                      }
                    }
                  }

                  if (hitBox && health) {
                    if (!gameMode.healthHit[tileId]) {
                      const hitBoxRect = hitBox.getBoundingClientRect();
                      const healthRect = health.getBoundingClientRect();

                      if (
                        hitBoxRect.left < healthRect.right &&
                        hitBoxRect.right > healthRect.left &&
                        hitBoxRect.top < healthRect.bottom
                      ) {
                        gameMode.healthHit[tileId] = true;
                        gameMode.lives++;
                        gameMode.feet += 10;

                        if (gameMode.lives > gameMode.maxLives) {
                          gameMode.lives = gameMode.maxLives;
                        }

                        // explode obstacle
                        if (health) {
                          health.style.display = 'none';
                        }
                      }
                    }
                  }
                }

                const left = (tile.x + gameMode.tileWidth + gameMode.mapLeftPadding) * pixleSize;

                if (left < 0) {
                  removeTile(tile.id);
                }
              }
            }

            return newTiles;
          });

          if (currentTime > timeTillNextTileSpawn) {
            spawnTile();
            timeTillNextTileSpawn = currentTime + gameMode.spawnTileSpeed;
          }
        }
      }

      if (bgmAudio) {
        if (gameMode.lives > 0) {
          if (bgmAudio.paused) {
            bgmAudio.currentTime = 0;
            bgmAudio.play();
          }
        } else {
          if (!bgmAudio.paused) {
            bgmAudio.pause();
          }
        }
      }

      requestAnimationFrame(update);
    };

    const frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const spawnTiles = (count = 1) => {
    for (let i = 0; i < count; i++) {
      spawnTile();
    }
  };

  const spawnTile = () => {
    setTiles((prev) => {
      const newTiles = new Map<string, ITile>(prev);
      const numberOfTiles = newTiles.size;

      if (numberOfTiles >= gameMode.maxTileCount) return newTiles;

      const lastTileId = lastTileIdRef.current;
      const lastTile = newTiles.get(lastTileId);

      const id = uuid();

      if (numberOfTiles == 0) setFirstTileId(id);

      const newTile: ITile = {
        id,
        x: numberOfTiles * gameMode.tileWidth,
        y: 0
      };

      if (lastTile) {
        newTile.x = lastTile.x + gameMode.tileWidth;
      }

      newTiles.set(id, newTile);

      setLastTileId(id);

      setTileIds((prevId) => [...prevId, id]);

      return newTiles;
    });
  };

  const removeTile = (id: string) => {
    setTileIds((prevId) => {
      const newIds = [...prevId];
      const nextId = newIds[0];
      const lastId = newIds[newIds.length - 1];

      setTiles((prev) => {
        const newTiles = new Map<string, ITile>(prev);
        newTiles.delete(id);

        setFirstTileId(nextId);
        setLastTileId(lastId);

        return newTiles;
      });
      return newIds;
    });
  };

  const spawnObstacleIfPossible = () => {
    const gameMode = gameModeRef.current;

    const canSpawnObstacle = Date.now() > timeTillNextObstacleSpawnRef.current;

    if (canSpawnObstacle && gameMode.state === ArcadeGameStateEnum.PLAYING) {
      const lastTile = tiles.get(lastTileId);

      if (lastTile && lastTile.hasObstacle) return;

      const random = Math.random();

      const spawn = random < gameMode.obstacleChance;

      console.log('spawnObstacleIfPossible', spawn);

      if (spawn) {
        console.log('spawnObstacleIfPossible', true, lastTile);

        if (lastTile) {
          setTiles((prev) => {
            const newTiles = new Map<string, ITile>(prev);
            const newTile = { ...lastTile, hasObstacle: true };
            newTiles.set(lastTileId, newTile);
            return newTiles;
          });

          timeTillNextObstacleSpawnRef.current = Date.now() + gameMode.spawnObstacleSpeed;
        }
      }
    }
  };

  const spawnHealthIfPossible = () => {
    const gameMode = gameModeRef.current;

    const canSpawnHealth = Date.now() > timeTillNextHealthSpawnRef.current;

    if (canSpawnHealth && gameMode.state === ArcadeGameStateEnum.PLAYING) {
      const lastTile = tiles.get(lastTileId);

      if (lastTile && lastTile.hasHealth) return;

      const random = Math.random();

      const spawn = random < gameMode.healthChance;

      console.log('spawnHealthIfPossible', spawn);

      if (spawn) {
        console.log('spawnHealthIfPossible', true, lastTile);

        if (lastTile) {
          setTiles((prev) => {
            const newTiles = new Map<string, ITile>(prev);
            const newTile = { ...lastTile, hasHealth: true };
            newTiles.set(lastTileId, newTile);
            return newTiles;
          });

          timeTillNextHealthSpawnRef.current = Date.now() + gameMode.spawnHealthSpeed;
        }

        console.log('spawnHealthIfPossible', true, lastTile);
      }
    }
  };

  const startGame = () => {
    if (loading) return;

    setLoading(true);

    setTiles(new Map<string, ITile>([]));
    setTileIds([]);

    spawnTiles(gameMode.startingTileCount);

    setLoading(false);
  };

  const jump = () => {
    if (isJumping) return;

    if (gameMode.jumpCount == 0 && gameMode.state == ArcadeGameStateEnum.STARTING) {
      gameMode.state = ArcadeGameStateEnum.PLAYING;
    }

    setIsJumping(true);

    const character = characterRef.current;
    const jumpArea = jumpAreaRef.current;

    if (character && jumpArea) {
      const pixleSize = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
      );

      const jumpSpeed = gameMode.jumpSpeed * 15 * pixleSize;

      const currentTop = character.offsetTop;

      const jumpLimit = currentTop - gameMode.jumpHeight * pixleSize;

      let timeStamp = Date.now();

      const jump = () => {
        const now = Date.now();
        const deltaTime = now - timeStamp;
        timeStamp = now;

        const characterTop = character.offsetTop;

        if (characterTop > jumpLimit) {
          character.style.top = `${characterTop - jumpSpeed * (deltaTime / 100)}px`;
          requestAnimationFrame(jump);
        } else {
          gameMode.jumpCount++;
          fall();
        }
      };

      const fall = () => {
        const now = Date.now();
        const deltaTime = now - timeStamp;
        timeStamp = now;

        const characterTop = character.offsetTop;

        if (characterTop < currentTop) {
          character.style.top = `${characterTop + jumpSpeed * (deltaTime / 100)}px`;
          requestAnimationFrame(fall);
        } else {
          character.style.top = `${currentTop}px`;
          setIsJumping(false);
        }
      };

      jump();
    }
  };

  const restartGame = () => {
    const newGameMode = new ArcadeGameMode();
    newGameMode.lives = newGameMode.maxLives;
    newGameMode.updateData(data);

    setGameMode(newGameMode);
    startGame();
  };

  const tap = () => {
    if (gameMode.lives > 0) {
      jump();
    }
  };

  if (loading) return null;

  return (
    <div className="w-full h-full" ref={mapRef}>
      <audio ref={audioRef} src={gameMode.bgm} loop></audio>
      <ArcadeGameSoundController
        gameMode={gameMode}
        jumped={isJumping}
        crashed={crashed}
        started={gameMode.lives > 0}
        gameOver={gameMode.lives <= 0}
      />
      <div className="absolute inset-0 bg-blue-300"></div>
      <div className="lives flex flex-row-reverse float-right p-2">
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
      <div className="tiles">
        {Array.from(tiles.values()).map((tile) => (
          <div
            key={tile.id}
            id={tile.id}
            className={`absolute`}
            style={{
              ...CSSDimensionsWithPixelSize(`${gameMode.tileWidth}px`, `${gameMode.tileHeight}px`),
              ...CSSPositionPixelSize(`150px + ${tile.x}px`, `60% + ${tile.y}px`)
            }}>
            <div
              className={`absolute inset-0 bg-green border-t-4 border-green-600 rounded-tr-lg ${
                tile.id == firstTileId ? 'border-l-4 rounded-tl-lg' : ''
              } ${tile.id == lastTileId ? 'border-r-4 rounded-tr-lg' : ''}`}
              style={{ height: '100px' }}></div>
            {tile.hasObstacle && (
              <div className="absolute inset-0 px-6" style={{ top: '-47px' }}>
                <div
                  id={`${tile.id}-obstacle`}
                  className="bg-tapgate-white w-full"
                  style={{ height: '46px' }}></div>
              </div>
            )}

            {tile.hasHealth && (
              <div className="absolute inset-0 px-6" style={{ top: '-250px' }}>
                <div
                  id={`${tile.id}-health`}
                  className="w-full text-center"
                  style={{ height: '25px', fontSize: '2em' }}>
                  💯
                </div>
              </div>
            )}
            <div
              className={`absolute inset-0 bg-yellow-300 border-t-4 border-yellow-600 ${
                tile.id == firstTileId ? 'border-l-4' : ''
              } ${tile.id == lastTileId ? 'border-r-4' : ''}`}
              style={{ top: '100px' }}></div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 h-1/6 bg-blue-500/75 border-t-4 border-blue-800/75"></div>
      <div
        className="absolute z-30 inset-0 flex justify-center items-center text-white font-black text-xl"
        style={{
          ...CSSPositionPixelSize(`0px`, `3vh`)
        }}
        ref={jumpAreaRef}>
        <div
          className={`character-container ${
            gameMode.lives < 1 ? 'dead' : ''
          } absolute z-10 overflow-hidden`}
          ref={characterRef}>
          <div className="absolute inset-0 flex justify-center items-center">
            <div
              className="hit-box"
              style={{ ...CSSDimensionsWithPixelSize('12px', '20px') }}
              ref={hitBoxRef}></div>
          </div>
          <Character
            outfit={outfit?.code}
            facingDirection={
              gameMode.lives > 0
                ? CharacterFacingDirectionEnum.RIGHT
                : CharacterFacingDirectionEnum.DOWN
            }
            isMoving={!isJumping && gameMode.lives > 0}
          />
        </div>
        {gameMode.lives < 1 && (
          <div className="character-container absolute z-10 overflow-hidden animate__animated animate__fadeOutUp opacity-25">
            <Character
              outfit={outfit?.code}
              facingDirection={CharacterFacingDirectionEnum.DOWN}
              isMoving={false}
            />
          </div>
        )}
      </div>
      <div
        className="absolute z-20 inset-0 bottom-[50vh] flex justify-center items-center text-white font-black text-5xl"
        onClick={() => tap()}>
        <div className="text-center">
          <div className="tracking-widest mb-2">
            {padStart(`${Math.floor(gameMode.feet) ?? 0}`, 4, '0')}
          </div>
          <div className="text-sm font-semibold">SCORE</div>
        </div>
      </div>
      <div
        className="absolute z-30 inset-0 bottom-[15vh] flex justify-center items-center text-white font-black text-xl"
        onClick={() => tap()}>
        {gameMode.lives > 0 ? (
          <div className="text-center">
            {gameMode.state == ArcadeGameStateEnum.STARTING
              ? !isJumping && <div className="text-indigo">TAP TO START</div>
              : ''}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-yellow mb-2">GAME OVER</div>
            <div className="flex justify-between gap-x-2">
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
