import './App.css';
import { BrowserRouter } from 'react-router-dom';
import WebRoutes from './pages/web/routes';
import ServerRoutes from './pages/server/routes';

function App() {
  switch (process.env.REACT_APP_CLIENT) {
    case 'web':
      return (
        <div className="App w-screen h-screen bg-tapgate-gray-600 text-tapgate-gray-100 select-none">
          {/* {
            <div className='fixed z-100 bottom-0 right-0 pointer-events-none'>
              <div className="bg-tapgate-gray-200/50 backdrop-blur p-4 text-white text-xs font-semibold uppercase rounded-tl-lg">
                {process.env.REACT_APP_CLIENT}
              </div>
            </div>
          } */}
          <BrowserRouter>
            <WebRoutes />
          </BrowserRouter>
        </div>
      );
    case 'server':
      return (
        <div className="App w-screen h-screen bg-tapgate-gray-600 text-tapgate-gray-100 select-none">
          {/* {
            <div className='fixed z-100 bottom-0 right-0 pointer-events-none'>
              <div className="bg-tapgate-gray-200/50 backdrop-blur p-4 text-white text-xs font-semibold uppercase rounded-tl-lg">
                {process.env.REACT_APP_CLIENT}
              </div>
            </div>
          } */}
          <BrowserRouter>
            <ServerRoutes />
          </BrowserRouter>
        </div>
      );
  }

  return (
    <div className="App w-screen h-screen bg-tapgate-gray-600 text-tapgate-gray-100 select-none">
      Client Not Set
    </div>
  );
}

export default App;
