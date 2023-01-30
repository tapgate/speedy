import { IItem } from '../../../../../models/item';
import { ArcadeGame } from '../../../../web/pages/games/arcade';

const DemoArcadeGamePage = () => {
  return (
    <ArcadeGame
      outfit={
        {
          code: 'emojii-panda'
        } as IItem
      }
    />
  );
};

const DemoArcadeGamePageContainer = () => {
  return <DemoArcadeGamePage />;
};

export default DemoArcadeGamePageContainer;
