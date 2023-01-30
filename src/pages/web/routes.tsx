import { Route, Routes } from 'react-router-dom';

import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import CollectionPage from './pages/collection';

import GamePlayPage from './pages/games/play';
import GameLobbyPage from './pages/games/lobby';
import GameLevelSelectPage from './pages/games/levels';

function WebRoutes() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/collection" element={<CollectionPage />} />

      <Route path="/games" element={<GameLobbyPage />} />
      <Route path="/games/:mode/levels" element={<GameLevelSelectPage />} />
      <Route path="/games/:mode/play" element={<GamePlayPage />} />
    </Routes>
  );
}

export default WebRoutes;
