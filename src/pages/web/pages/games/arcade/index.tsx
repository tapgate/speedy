import kaboom from 'kaboom';
import { useEffect, useRef, useState } from 'react';
import MobileView from '../../../../../components/mobile-view';
import { useGame } from '../../../../../context/game';
import { useUser } from '../../../../../context/user';
import { IItem } from '../../../../../models/item';
import { IGameData } from '../../../../../utils/game';
import { Player } from './kaboom/classes/player';
import { IGameSceneEnum, IGameStateEnum } from './kaboom/constants';
import { GameMaps } from './kaboom/levels';
import { IKaboomCtxExt } from './kaboom/shared/types';

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

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<IGameStateEnum>(IGameStateEnum.STARTING);

  const sceneContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kaboomRef = useRef<any>(null);
  const kaboomScaleRef = useRef<number>(4);

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current as HTMLCanvasElement;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      kaboomRef.current.destroy();
      setGameState(IGameStateEnum.STARTING);
    };

    window.addEventListener('resize', onResize);

    // if window is a mobile device, set scale to 0.5
    if (window.innerWidth < 768) {
      kaboomScaleRef.current = 2;
    }

    return () => {
      try {
        if (kaboomRef.current) {
          console.log('destroying kaboom', kaboomRef.current);
          kaboomRef.current.destroy();
        }
      } catch (err) {
        console.log('error destroying kaboom', err);
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
    if (!kaboomRef.current) {
      // get screen actual size
      const width = sceneContainerRef.current?.clientWidth || 0;

      console.log({ width });

      kaboomRef.current = kaboom({
        global: false,
        canvas: canvas,
        scale: kaboomScaleRef.current,
        font: 'minecraft',
        crisp: true,
        debug: true,
        ...(kaboomScaleRef.current < 4 ? ({ width, height: width } as any) : {})
      }) as IKaboomCtxExt;
    }

    const k = kaboomRef.current;

    const layerProps = [k.fixed(), k.z(0)];

    k.layers = {
      skyBox: [...layerProps, 'skyBox', k.pos(0, 0), k.fixed()],
      clouds: [...layerProps, 'layer:clouds', k.z(1)],
      bg: [...layerProps, 'layer:bg', k.z(2)],
      platforms: new Array(3)
        .fill(0)
        .map((x, i) => [...layerProps, `layer:platform-${i}`, k.z(3 + i)]),
      player: [...layerProps, 'layer:player', k.z(6)]
    };

    const levels = {
      unotown: GameMaps.Unotown(k)
    };

    Player.generateSprites(k);

    k.loadFont('minecraft', '/fonts/minecraft.ttf');

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

    let bgmAudio: any;

    k.scene(IGameSceneEnum.GAME_OVER, () => {
      if (bgmAudio) bgmAudio.paused = true;
      bgmAudio = k.play('game-over-bgm');

      const skyBox = k.add([
        ...layerProps,
        k.anchor('topleft'),
        k.rect(k.width(), k.height()),
        k.color(127, 200, 255)
      ]);

      const ui = k.add([...layerProps, 'layer:ui', k.pos(0, 0), k.anchor('topleft'), k.z(1)]);

      ui.add([
        k.text('Game Over', {
          size: 16
        }),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor('center')
      ]);

      ui.add([
        k.text('Click to restart', {
          size: 16
        }),
        k.pos(k.width() / 2, k.height() / 2 + 32),
        k.anchor('center')
      ]);

      k.onClick(() => {
        k.go(IGameSceneEnum.GAME);
      });

      k.onKeyPress('space', () => {
        k.go(IGameSceneEnum.GAME);
      });

      k.onTouchStart(() => {
        k.go(IGameSceneEnum.GAME);
      });

      k.onGamepadButtonPress('start', () => {
        k.go(IGameSceneEnum.GAME);
      });
    });

    k.scene(IGameSceneEnum.GAME, () => {
      k.onGamepadButtonPress('select', () => {
        // reload page
        window.location.reload();
      });

      const player = new Player(k, { tag: 'player', isNPC: false, outfit: outfit });

      setPlayer(player);

      if (bgmAudio) bgmAudio.paused = true;

      bgmAudio = k.play('bgm');

      const skyBox = k.add([
        ...layerProps,
        k.anchor('topleft'),
        k.rect(k.width(), k.height()),
        k.color(127, 200, 255)
      ]);

      k.level = levels.unotown.routes[0].load({
        player: player
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
        k.go(IGameSceneEnum.GAME);
      }
    }
  };

  const tap = () => {
    if (gameState == IGameStateEnum.STARTING) {
      startGame();
    }
  };

  const k = kaboomRef.current;

  if (k) {
    k.onTouchStart(tap);
    k.onKeyPress('space', tap);
    k.onGamepadButtonPress('start', tap);
  }

  const HUD =
    gameState == IGameStateEnum.STARTING ? (
      <div className="absolute inset-0 bg-gray-700 z-20">
        <div className="w-full h-full flex flex-wrap justify-center items-center overflow-auto pb-4">
          <div className="w-full xl:w-1/4 max-w-[80vw]">
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
    <div id="scene-container" className="relative w-full h-full" ref={sceneContainerRef}>
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
