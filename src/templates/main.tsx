import { ReactNode } from 'react';
import Menu from '../components/menu';
import Navbar from '../components/navbar';
import NavigatorProvider, { useNavigator } from '../context/navigation';
import { useUser } from '../context/user';

export interface MainTemplateProps {
  children: ReactNode;
}

function MainTemplate({ children }: MainTemplateProps) {
  const { showMenu, toggleMenu } = useNavigator();
  const { user } = useUser();

  const content = (
    <div className="relative h-full pr-6 overflow-auto" style={{ width: 'calc(100% + 20px)' }}>
      <div className="absolute w-screen xl:w-full h-full">{children}</div>
    </div>
  );

  return (
    <div className="main-template w-screen h-screen">
      {user && (
        <header className="w-full h-[70px] bg-tapgate-black">
          <Navbar />
        </header>
      )}

      <div className="w-full h-full flex" style={{ height: user ? 'calc(100% - 70px)' : '' }}>
        <div className="w-0 xl:w-[15%] h-full border-r-2 border-tapgate-black overflow-hidden">
          <Menu />
        </div>

        <main
          className="relative w-full xl:w-[85%] overflow-hidden"
          style={{ height: user ? 'calc(100% - 70px)' : '100%' }}>
          {content}

          {user && (
            <>
              <div
                className={`xl:hidden absolute inset-0 z-10 ease-in duration-300 flex justify-end items-center ${
                  showMenu ? 'bg-tapgate-black/50 backdrop-blur' : 'pointer-events-none'
                }`}>
                <div
                  className={`absolute inset-0 ${showMenu ? 'cursor-pointer' : ''}`}
                  onClick={() => toggleMenu()}></div>
                <div
                  className={`w-1/2 max-w-[250px] h-full animate__animated animate__fast ${
                    showMenu ? 'animate__slideInRight' : 'animate__slideOutRight'
                  }`}>
                  <div className="w-full h-full">
                    <Menu />
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function MainTemplateContainer({ children }: MainTemplateProps) {
  return (
    <NavigatorProvider>
      <MainTemplate>{children}</MainTemplate>
    </NavigatorProvider>
  );
}

export default MainTemplateContainer;
