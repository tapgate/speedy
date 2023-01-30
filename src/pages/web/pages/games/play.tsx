import { useGame } from '../../../../context/game';
import { useNavigator } from '../../../../context/navigation';
import { GameModeEnum } from '../../../../utils/game';
import ClassicGame from './classic';
import ArcadeGame from './arcade';
import UserTemplateContainer from '../../../../templates/user';

const GamePlayPage = () => {
  const { navigate } = useNavigator();
  const { mode } = useGame();

  switch (mode) {
    case GameModeEnum.Classic:
      return <ClassicGame />;
    case GameModeEnum.Arcade:
      return <ArcadeGame />;
    default:
      navigate('/games');
      return null;
  }
};

const GamePlayPageContainer = () => {
  return (
    <UserTemplateContainer>
      <GamePlayPage />
    </UserTemplateContainer>
  );
};

export default GamePlayPageContainer;
