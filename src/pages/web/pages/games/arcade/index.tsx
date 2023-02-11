import kaboom from 'kaboom';
import { useEffect, useRef, useState } from 'react';
import MobileView from '../../../../../components/mobile-view';
import { useGame } from '../../../../../context/game';
import { useUser } from '../../../../../context/user';
import { IItem } from '../../../../../models/item';
import { IGameData } from '../../../../../utils/game';
import {
  Character,
  ICharacterColorEnum,
  ICharacterDirectionEnum
} from './kaboom/classes/character';
import { UI } from './kaboom/classes/ui';
import { Components } from './kaboom/components';
import { GameMaps } from './kaboom/levels';

enum IGameStateEnum {
  STARTING = 'starting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game-over'
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

export interface IArcadeGameProps {
  outfit?: IItem | null;
  data?: IGameData;
  quit?: () => void;
}

export const ArcadeGame = ({ outfit, data, quit }: IArcadeGameProps) => {
  const FLOOR_HEIGHT = 32;
  const SPEED = 120;

  const [player, setPlayer] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<IGameStateEnum>(IGameStateEnum.STARTING);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kaboomRef = useRef<any>(null);

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current as HTMLCanvasElement;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      delete kaboomRef.current;
      setGameState(IGameStateEnum.STARTING);
    };

    window.addEventListener('resize', onResize);

    return () => {
      if (kaboomRef.current) {
        kaboomRef.current.destroy();
      }

      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (gameState === IGameStateEnum.STARTING && canvasRef.current) {
      loadGame(canvasRef.current);
    }
  }, [gameState]);

  const loadGame = (canvas: HTMLCanvasElement) => {
    kaboomRef.current = kaboom({
      global: false,
      canvas: canvas,
      scale: 4,
      font: 'sinko',
      crisp: true,
      debug: true
    });

    const k = kaboomRef.current;
    const comp = Components(k);
    const maps = {
      unotown: GameMaps.Unotown(k)
    };

    k.loadSound('jump', '/sounds/jump.mp3');

    k.loadSound('crash', '/sounds/crash.mp3');

    k.loadSound('game-over', '/sounds/game-over.mp3');

    k.loadSound('bgm', '/music/eric-skiff-underclocked-no-copyright-8-bit-music-background.mp3');

    k.loadSound('game-over-bgm', '/music/monplaisir-soundtrack-no-copyright-8-bit-music.mp3');

    k.loadSpriteAtlas('images/sky/clouds.png', {
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

    const skybox = [
      k.rect(k.width(), k.height()),
      k.pos(k.width(), k.height()),
      k.origin('botright'),
      k.color(127, 200, 255),
      k.layer('sky'),
      k.fixed()
    ];

    const player = new Character(k, ICharacterColorEnum.YELLOW, outfit);

    const ui = new UI(k, player);

    setPlayer(player);

    let bgmAudio: any;

    k.scene('game-over', () => {
      bgmAudio?.stop();
      bgmAudio = k.play('game-over-bgm');

      k.add(skybox);

      k.add([k.text('Game Over', 32), k.pos(k.width() / 2, k.height() / 2), k.origin('center')]);

      k.add([
        k.text('Click to restart', 16),
        k.pos(k.width() / 2, k.height() / 2 + 32),
        k.origin('center')
      ]);

      k.onClick(() => {
        k.go('game');
      });

      k.onKeyPress('space', () => {
        k.go('game');
      });

      k.onTouchStart(() => {
        k.go('game');
      });
    });

    k.scene('game', () => {
      const layers = [
        'sky',
        'clouds',
        'bg',
        ...new Array(3)
          .fill(0)
          .map((x, i) => `platform-${i}`)
          .reverse(),
        'game',
        'ui'
      ];

      console.log({ layers });

      k.layers(layers, 'game');

      bgmAudio?.stop();

      bgmAudio = k.play('bgm');

      console.log('game');

      k.add(skybox);

      const map = maps.unotown.routes[0].load();

      player.load([
        'player',
        k.health(player.maxHealth),
        k.sprite('player'),
        k.pos(map.getPos(38, 11)),
        k.origin('center'),
        k.area({
          offset: k.vec2(0, 1),
          scale: k.vec2(0.25, 0.25)
        }),
        k.body()
      ]);

      ui.load([
        'ui',
        k.pos(0, 0),
        k.origin('topleft'),
        k.layer('bg'),
        k.fixed(),
        k.rect(k.width(), k.height()),
        k.opacity(0)
      ]);

      const { Camera } = comp;

      const cameraTarget = k.add([
        k.rect(16, 16),
        k.area(),
        k.pos(player.object.pos),
        k.origin('center'),
        k.color(75, 180, 255),
        k.opacity(0),
        Camera.smoothFollow(player.object),
        'camera-target'
      ]);

      k.onKeyPress('space', () => {
        player.jump();
      });

      // player movement WASD
      k.onKeyDown('w', () => {
        player.walk(ICharacterDirectionEnum.UP);
      });

      k.onKeyDown('a', () => {
        player.walk(ICharacterDirectionEnum.LEFT);
      });

      k.onKeyDown('s', () => {
        player.walk(ICharacterDirectionEnum.DOWN);
      });

      k.onKeyDown('d', () => {
        player.walk(ICharacterDirectionEnum.RIGHT);
      });

      k.onKeyPress(['a', 'd', 'w', 's'], () => {
        player.object.play(`walk-${player.facingDirection}`);
      });

      k.onKeyRelease(['a', 'd', 'w', 's'], () => {
        player.object.play(`idle-${player.facingDirection}`);
        player.stopWalking();
      });

      k.onKeyPress('shift', () => {
        player.isSprinting = true;
      });

      k.onKeyRelease('shift', () => {
        player.isSprinting = false;
      });

      k.onUpdate('block', (b: any) => {
        b.solid = b.pos.dist(player.object.pos) <= 8;
      });

      setGameState(IGameStateEnum.PLAYING);
    });

    k.onLoad(() => {
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

  const HUD =
    gameState == IGameStateEnum.STARTING ? (
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
                show off your skills by soaring over obstacles, fighting enimies such as rats, boars
                and other typical RPG monsters. Collect trinkets, tonics and snake oil! err... and
                Treasure while you play. Will you earn the legendary sword? So what are you waiting
                for? Put your game face on and let's see how far you can soar! Good luck,
                challenger!
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
                        navigator.clipboard.writeText('0x0f22d432a183B91C364FEcc44f43FE1565E88ec3');
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
      <div className="absolute inset-0 z-20 pointer-events-none"></div>
    );

  return (
    <div className="relative w-full h-full">
      {HUD}
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
