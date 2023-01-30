import MobileView from '../../../../components/mobile-view';
import WithPageHeader from '../../../../components/with-page-header';
import { useGame } from '../../../../context/game';
import { useNavigator } from '../../../../context/navigation';
import UserTemplateContainer from '../../../../templates/user';
import { GameModeEnum } from '../../../../utils/game';

const GamesLobbyPage = () => {
  const { navigate } = useNavigator();
  const { mode, setMode } = useGame();

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
      navigate(`/games/${id}/levels`);
    }
  };

  return (
    <MobileView title="Games Lobby">
      <div className="w-full h-full">
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
