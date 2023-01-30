import GameProvider from '../context/game';
import UserProvider from '../context/user';
import MainTemplateContainer from './main';

const UserTemplateContainer = (props: any) => {
  return (
    <UserProvider>
      <MainTemplateContainer>
        <GameProvider>{props.children}</GameProvider>
      </MainTemplateContainer>
    </UserProvider>
  );
};

export default UserTemplateContainer;
