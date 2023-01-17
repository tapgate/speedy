import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/user';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      // navigate to login page
      navigate('/login');
    } else {
      // navigate to game lobby
      navigate('/game');
    }
  }, [user]);

  // create loading spinner svg
  return <div className="w-full h-full flex justify-center items-center">Loading...</div>;
};

export default HomePage;
