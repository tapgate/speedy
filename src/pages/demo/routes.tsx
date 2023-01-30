import { Route, Routes } from 'react-router-dom';

import DemoArcadeGame from './pages/games/arcade';

function DemoRoutes() {
  return (
    <Routes>
      <Route path="/demo" element={<DemoArcadeGame />} />
    </Routes>
  );
}

export default DemoRoutes;
