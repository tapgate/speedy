import { createContext, useState, useEffect, useContext, useRef } from 'react';
import pocketbase from '../utils/pocketbase';
import { IGameMode } from '../models/game';
import { Game, IGameData, IGameEvent } from '../utils/game';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

pocketbase.autoCancellation(false);

export enum GameView {
  LOBBY = 'lobby',
  PLAY = 'play'
}

interface GameContext {
  view: GameView;
  data: IGameData;

  trigger: (event: IGameEvent) => void;

  setView: (view: GameView) => void;
  setMode: (mode: IGameMode) => void;

  restartGame: () => void;
  quitGame: () => void;
}

const Context = createContext<GameContext>({} as GameContext);

const GameProvider = ({ children }: any) => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<IGameMode>();
  const [prevMode, setPrevMode] = useState<IGameMode>();
  const [view, setView] = useState<GameView>(GameView.LOBBY);

  const [data, setData] = useState<IGameData>({} as IGameData);

  const animateionRef = useRef<number>();
  const gameRef = useRef<Game>();
  const eventRef = useRef<IGameEvent>();

  useEffect(() => {
    const update = () => {
      const game = gameRef.current;

      if (game) {
        if (eventRef.current) {
          game.trigger(eventRef.current);
          eventRef.current = undefined;
        }

        game.update();
        setData(game.data);
      }

      requestAnimationFrame(update);
    };

    animateionRef.current = requestAnimationFrame(update);

    return () => {
      if (animateionRef.current) {
        cancelAnimationFrame(animateionRef.current);
      }
    };
  }, [gameRef.current]);

  useEffect(() => {
    restartGame();

    if (_.isEqual(mode, prevMode) || !mode) return;

    setPrevMode(mode);

    console.log('mode changed', mode);

    pocketbase.collection('speedy_game_modes').subscribe(mode.id, (data) => {
      const record = data.record as unknown as IGameMode;

      console.log('mode updated', record);

      switch (data.action) {
        case 'update':
          setMode(record);
          break;
        default:
          break;
      }
    });

    return () => {
      pocketbase.collection('speedy_game_modes').unsubscribe(mode.id);
    };
  }, [mode]);

  const stopGame = () => {
    if (animateionRef.current) {
      cancelAnimationFrame(animateionRef.current);
    }

    delete gameRef.current;

    setData({} as IGameData);
  };

  const restartGame = () => {
    if (mode) {
      stopGame();
      gameRef.current = new Game(mode);
    } else {
      quitGame();
    }
  };

  const quitGame = () => {
    stopGame();
    setMode(undefined);
    setData({} as IGameData);
    navigate('/game');
  };

  const trigger = (event: IGameEvent) => {
    eventRef.current = event;
  };

  const exposed = {
    view,
    data,

    trigger,

    setView,
    setMode,

    restartGame,
    quitGame
  };

  return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useGame = () => useContext(Context);

export default GameProvider;
