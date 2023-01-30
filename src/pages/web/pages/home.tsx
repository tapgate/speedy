import Page from '../../../components/page';
import UserTemplateContainer from '../../../templates/user';

const HomePage = () => {
  // create loading spinner svg
  return (
    <Page title={`Home`}>
      <div className="w-full h-full flex justify-center items-center">Loading...</div>
    </Page>
  );
};

const HomePageContainer = () => {
  return (
    <UserTemplateContainer>
      <HomePage />
    </UserTemplateContainer>
  );
};

export default HomePageContainer;
