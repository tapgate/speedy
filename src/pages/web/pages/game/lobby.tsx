import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileView from '../../../../components/mobile-view';
import { GameView, useGame } from '../../../../context/game';
import { IGameMode, IGameModes } from '../../../../models/game';
import pocketbase from '../../../../utils/pocketbase';

const GameLobby = () => {
  const navigate = useNavigate();

  const { data, setView, setMode } = useGame();

  const [modes, setModes] = useState<IGameModes>([]);

  useEffect(() => {
    setView(GameView.LOBBY);
  }, []);

  useEffect(() => {
    const getModes = async () => {
      const data = await pocketbase.collection('speedy_game_modes').getFullList(100, {
        sort: '+index'
      });

      if (data) {
        setModes(data as unknown as IGameModes);
      }
    };

    getModes();

    // subscribe to speey game modes realtime updates
    pocketbase.collection('speedy_game_modes').subscribe('*', (data) => {
      const record = data.record as unknown as IGameMode;

      switch (data.action) {
        case 'insert':
          setModes((prev) => [...prev, record]);
          break;
        case 'update':
          setModes((prev) => {
            const index = prev.findIndex((item) => item.id === record.id);
            prev[index] = record;
            return [...prev];
          });
          break;
        case 'delete':
          setModes((prev) => {
            const index = prev.findIndex((item) => item.id === record.id);
            prev.splice(index, 1);
            return [...prev];
          });
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    console.log('data.level', data.level);
    if (data.level) {
      navigate('/game/play');
    }
  }, [data.level]);

  const selectMode = (mode: IGameMode) => {
    setMode(mode);
  };

  return (
    <MobileView>
      <div className="w-full h-full flex flex-wrap gap-y-4 justify-center items-center p-6">
        <div className="w-full">
          {/* Start Logo Area */}
          <div className="w-full h-[150px] flex flex-wrap items-center justify-center">
            <div className="w-full h-full flex flex-wrap items-center justify-center">
              <div>
                <div className="w-fulll flex justify-center items-center text-tapgate-blue font-black tracking-widest text-4xl">
                  SPEED TEST
                </div>
                <div className="w-full text-sm text-center p-2 text-tapgate-gray-100">
                  Increase Your Agillity And Speed
                </div>
              </div>
            </div>
          </div>
          {/* End Logo Area */}
          <div className="w-full flex flex-wrap gap-y-8">
            {/* Start Button Area */}
            {modes.map((mode, index) => {
              return (
                <div key={index} className="w-full h-[150px] flex">
                  <div
                    onClick={() => selectMode(mode)}
                    className="w-full h-full cursor-pointer bg-gradient-to-r from-tapgate-gray-600 via-tapgate-gray-500 to-tapgate-gray-600 backdrop-blur-lg border-4 active:opacity-75 active:scale-95 border-tapgate-gray-700/25 rounded-xl">
                    <div className="w-full h-full relative flex justify-center items-center">
                      <div className="absolute top-0 left-0 w-1/3 h-full">
                        <div className="relative w-full h-full">
                          <div
                            className="absolute inset w-full h-full bg-center bg-contain bg-no-repeat"
                            style={{
                              backgroundImage: `url(images/bolt-${mode.color}.png)`
                            }}></div>
                        </div>
                      </div>
                      <div className={`font-black text-5xl text-tapgate-${mode.color} uppercase`}>
                        {mode.level}
                      </div>
                      <div className="text-tapgate-gray-200 font-bold absolute bottom-0 right-0 px-4 pb-2">
                        {mode.speed} ms
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* End Button Area */}
          </div>
        </div>
      </div>
    </MobileView>
  );
};

export default GameLobby;
