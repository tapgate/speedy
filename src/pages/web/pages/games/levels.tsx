import Case from 'case';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../../components/icons';
import MobileView from '../../../../components/mobile-view';
import WithPageHeader from '../../../../components/with-page-header';
import { useGame } from '../../../../context/game';
import { IGameLevel, IGameLevels } from '../../../../models/game';
import UserTemplateContainer from '../../../../templates/user';
import pocketbase from '../../../../utils/pocketbase';

const GameLevelSelectPage = () => {
  const navigate = useNavigate();

  const { mode, data, setLevel } = useGame();

  const [levels, setLevels] = useState<IGameLevels>([]);

  useEffect(() => {
    const getLevels = async () => {
      const data = await pocketbase.collection('game_levels').getFullList(100, {
        sort: '+index',
        filter: `mode = "${mode}"`
      });

      if (data) {
        setLevels(data as unknown as IGameLevels);
      }
    };

    getLevels();

    // subscribe to speey game levels realtime updates
    pocketbase.collection('game_levels').subscribe('*', (data) => {
      const record = data.record as unknown as IGameLevel;

      switch (data.action) {
        case 'insert':
          setLevels((prev) => [...prev, record]);
          break;
        case 'update':
          setLevels((prev) => {
            const index = prev.findIndex((item) => item.id === record.id);
            prev[index] = record;
            return [...prev];
          });
          break;
        case 'delete':
          setLevels((prev) => {
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
    if (!mode || !data.level) {
      navigate('/games');
    } else {
      navigate(`/games/${mode}/play`);
    }
  }, [mode, data.level]);

  const selectLevel = (level: IGameLevel) => {
    setLevel(level);
  };

  const pageTitle = `${Case.title(mode ?? 'Unknown Game Mode')} Levels`;

  return (
    <MobileView title={pageTitle}>
      <WithPageHeader
        title={pageTitle}
        icon={<Icon className="cursor-pointer" name="Back" onClick={() => navigate('/games')} />}>
        <div className="w-full h-full overflow-auto flex flex-wrap gap-y-4 justify-center p-6">
          <div className="w-full">
            <div className="w-full flex flex-wrap justify-center gap-y-8">
              {/* Start Button Area */}
              {levels.map((level, index) => {
                return (
                  <div key={index} className="w-full max-w-[414px] h-[168px] flex">
                    <div
                      onClick={() => selectLevel(level)}
                      className="w-full h-full cursor-pointer bg-gradient-to-r from-tapgate-gray-600 via-tapgate-gray-500 to-tapgate-gray-600 backdrop-blur-lg border-4 active:opacity-75 active:scale-95 border-tapgate-gray-700/25 rounded-xl">
                      <div className="w-full h-full relative flex justify-center items-center">
                        <div className="absolute top-0 left-0 w-1/3 h-full">
                          <div className="relative w-full h-full">
                            <div
                              className="absolute inset w-full h-full bg-center bg-contain bg-no-repeat"
                              style={{
                                backgroundImage: `url(images/bolt-${level.color}.png)`
                              }}></div>
                          </div>
                        </div>
                        <div
                          className={`font-black text-5xl text-tapgate-${level.color} uppercase`}>
                          {level.name}
                        </div>
                        <div className="text-tapgate-gray-200 font-bold absolute bottom-0 right-0 px-4 pb-2">
                          {level.speed} ms
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
      </WithPageHeader>
    </MobileView>
  );
};

const GameLevelSelectPageContainer = () => {
  return (
    <UserTemplateContainer>
      <GameLevelSelectPage />
    </UserTemplateContainer>
  );
};

export default GameLevelSelectPageContainer;
