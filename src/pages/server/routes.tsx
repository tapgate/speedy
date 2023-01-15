import React from 'react';
import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/home';


function ServerRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default ServerRoutes;
