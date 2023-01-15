import React from 'react';
import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';

import UserProvider from '../../context/user';

import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import GamePage from './pages/game';

function WebRoutes() {
  return (
    <UserProvider>
        <Routes>
            {/* <Route path="/" element={<HomePage />} /> */}
            <Route path='/' element={<GamePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path='/game' element={<GamePage />} />
        </Routes>
    </UserProvider>
  );
}

export default WebRoutes;
