import React from 'react';
import { Route, Routes } from 'react-router-dom';

import UserProvider from '../../context/user';

import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import GameProvider from '../../context/game';
import GamePlay from './pages/game/play';
import GameLobby from './pages/game/lobby';
import HomePage from './pages/home';
import MainTemplateContainer from '../../templates/main';

function WebRoutes() {
  return (
    <UserProvider>
      <MainTemplateContainer>
        <GameProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/game" element={<GameLobby />} />
            <Route path="/game/play" element={<GamePlay />} />
          </Routes>
        </GameProvider>
      </MainTemplateContainer>
    </UserProvider>
  );
}

export default WebRoutes;
