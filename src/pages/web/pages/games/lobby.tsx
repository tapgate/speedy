import { useEffect, useState } from 'react';
import MobileView from '../../../../components/mobile-view';
import WithPageHeader from '../../../../components/with-page-header';
import { useGame } from '../../../../context/game';
import { useNavigator } from '../../../../context/navigation';
import { useUser } from '../../../../context/user';
import UserTemplateContainer from '../../../../templates/user';
import { GameModeEnum } from '../../../../utils/game';
import { ArcadeGame } from './arcade';
import { ClassicGame } from './classic';
import { GameLevelSelectPage } from './levels';

enum GameViewEnum {
  List = 'list',
  Levels = 'levels',
  Play = 'play'
}

const GamesLobbyPage = () => {
  const { navigate } = useNavigator();
  const { user, outfit, loading: userLoading } = useUser();
  const { mode, level, setMode } = useGame();

  const [view, setView] = useState<GameViewEnum>(GameViewEnum.List);

  useEffect(() => {
    if (level) {
      setView(GameViewEnum.Play);
    }
  }, [level]);

  // create list from game modes
  const gameModes = [
    {
      id: GameModeEnum.Classic,
      name: 'Classic',
      description: 'Classic game mode'
    },
    {
      id: GameModeEnum.Arcade,
      name: 'Arcade',
      description: 'Arcade game mode'
    }
  ];

  const selectMode = (id: GameModeEnum) => {
    if (id) {
      setMode(id);
      setView(GameViewEnum.Levels);
    }
  };

  if (!user || userLoading) return null;

  return (
    <MobileView title="Games Lobby">
      <div className="w-full h-full">
        {view === GameViewEnum.List && (
          <WithPageHeader title="Games Lobby">
            <div className="w-full h-[95%] p-4 overflow-auto">
              <div className="flex flex-wrap">
                {gameModes.map((gameMode) => {
                  return (
                    <div key={gameMode.id} className="w-full max-w-[450px] h-[200px] p-4">
                      <div className="relative w-full h-full">
                        <div
                          className={`realtive w-full h-full overflow-hidden rounded-lg border-2 border-tapgate-gray`}>
                          <div className="w-full h-full">
                            <img
                              src={`images/games/modes/${gameMode.id}.png`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute inset-0 ease-in-out bg-tapgate-black-600/75 rounded-lg"></div>
                            <div className="absolute inset-0 pointer-events-none flex justify-center items-center uppercase text-tapgate-white drop-shadow-lg font-black text-2xl tracking-widest">
                              <div>{gameMode.name}</div>
                            </div>
                          </div>
                          <div
                            className="absolute inset-0 rounded-lg border-2 border-tapgate-black overflow-hidden cursor-pointer duration-300 opacity-0 hover:opacity-100"
                            onClick={() => selectMode(gameMode.id)}>
                            <img
                              src={`images/games/modes/${gameMode.id}.png`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </WithPageHeader>
        )}

        {view === GameViewEnum.Levels && (
          <GameLevelSelectPage goBack={() => setView(GameViewEnum.List)} />
        )}

        {view === GameViewEnum.Play && mode && mode == GameModeEnum.Classic && (
          <ClassicGame user={user} quit={() => setView(GameViewEnum.List)} />
        )}
        {view === GameViewEnum.Play && mode && mode == GameModeEnum.Arcade && (
          <ArcadeGame outfit={outfit} quit={() => setView(GameViewEnum.List)} />
        )}
      </div>
    </MobileView>
  );
};

const GamesLobbyPageContainer = () => {
  return (
    <UserTemplateContainer>
      <GamesLobbyPage />
    </UserTemplateContainer>
  );
};

export default GamesLobbyPageContainer;
