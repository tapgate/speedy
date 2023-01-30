import { Route, Routes } from 'react-router-dom';

import DemoArcadeGame from './pages/games/arcade';

function DemoRoutes() {
  return (
    <Routes>
      <Route path="/games/arcade/demo" element={<DemoArcadeGame />} />
    </Routes>
  );
}

export default DemoRoutes;
