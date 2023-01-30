import { createContext, useState, useEffect, useContext, useRef } from 'react';
import pocketbase from '../utils/pocketbase';
import { IGameLevel } from '../models/game';
import { Game, IGameData, GameEventEnum, GameModeEnum } from '../utils/game';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

pocketbase.autoCancellation(false);

export enum GameViewEnum {
  LOBBY = 'lobby',
  PLAY = 'play'
}

interface GameContext {
  mode: GameModeEnum | undefined;
  level: IGameLevel | undefined;
  data: IGameData;

  trigger: (event: GameEventEnum) => void;

  setMode: (mode: GameModeEnum) => void;
  setLevel: (mode: IGameLevel) => void;

  restartGame: () => void;
  quitGame: () => void;
}

const Context = createContext<GameContext>({} as GameContext);

const GameProvider = ({ children }: any) => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<GameModeEnum>();
  const [level, setLevel] = useState<IGameLevel>();
  const [prevMode, setPrevMode] = useState<IGameLevel>();

  const [data, setData] = useState<IGameData>({} as IGameData);

  const animateionRef = useRef<number>();
  const gameRef = useRef<Game>();
  const eventRef = useRef<GameEventEnum>();

  useEffect(() => {
    setLevel(undefined);
  }, [mode]);

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

    if (_.isEqual(level, prevMode) || !level) return;

    setPrevMode(level);

    console.log('level changed', level);

    pocketbase.collection('game_levels').subscribe(level.id, (data) => {
      const record = data.record as unknown as IGameLevel;

      console.log('level updated', record);

      switch (data.action) {
        case 'update':
          setLevel(record);
          break;
        default:
          break;
      }
    });

    return () => {
      pocketbase.collection('game_levels').unsubscribe(level.id);
    };
  }, [level]);

  const stopGame = () => {
    if (animateionRef.current) {
      cancelAnimationFrame(animateionRef.current);
    }

    delete gameRef.current;

    setData({} as IGameData);
  };

  const restartGame = () => {
    if (level) {
      stopGame();
      gameRef.current = new Game(level);
    } else {
      quitGame();
    }
  };

  const quitGame = () => {
    stopGame();
    setLevel(undefined);
    setData({} as IGameData);
    if (mode) {
      navigate(`/games/${mode}/levels`);
    }
  };

  const trigger = (event: GameEventEnum) => {
    eventRef.current = event;
  };

  const exposed = {
    mode,
    level,
    data,

    trigger,

    setMode,
    setLevel,

    restartGame,
    quitGame
  };

  return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useGame = () => useContext(Context);

export default GameProvider;
