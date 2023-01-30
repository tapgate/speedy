import { ReactNode, useEffect, useRef } from 'react';
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

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menuContainer = menuContainerRef.current;
    const menu = menuRef.current;

    if (!menuContainer || !menu) return;

    switch (showMenu) {
      case true:
        menuContainer.classList.remove('opacity-0');
        menuContainer.classList.remove('pointer-events-none');

        menuContainer.classList.add('bg-tapgate-black/50');
        menuContainer.classList.add('backdrop-blur');

        menu.classList.remove('opacity-0');
        menu.classList.remove('animate__slideOutRight');

        menu.classList.add('animate__slideInRight');
        break;
      case false:
        menuContainer.classList.remove('bg-tapgate-black/50');
        menuContainer.classList.remove('backdrop-blur');

        menuContainer.classList.add('animate__fadeOutRight');
        menuContainer.classList.add('pointer-events-none');

        menu.classList.remove('animate__slideInRight');

        menu.classList.add('animate__slideOutRight');
        break;
    }
  }, [showMenu]);

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

        <main className="relative w-full h-full xl:w-[85%] overflow-hidden">
          {content}

          {user && (
            <>
              <div
                className={`xl:hidden absolute inset-0 ease-in duration-300 flex justify-end items-center opacity-0 pointer-events-none`}
                style={{ zIndex: '10000000' }}
                ref={menuContainerRef}>
                <div
                  className={`absolute inset-0 ${showMenu ? 'cursor-pointer' : ''}`}
                  onClick={() => toggleMenu()}></div>
                <div
                  className={`w-1/2 max-w-[250px] h-full opacity-0 animate__animated animate__fast`}
                  ref={menuRef}>
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
