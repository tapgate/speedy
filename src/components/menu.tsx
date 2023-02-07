import { useNavigator } from '../context/navigation';
import { useUser } from '../context/user';
import Character from './character';
import { Icon } from './icons';

function Menu() {
  const { user, outfit, logout } = useUser();
  const { navigate, toggleMenu } = useNavigator();

  if (!user) return null;

  const activeLink = (link: string) => {
    return window.location.pathname === link ? 'active' : '';
  };

  const menuClick = (link: string) => {
    toggleMenu();

    switch (link) {
      case '/logout':
        logout();
        break;
      default:
        navigate(link);
        break;
    }
  };

  const menu = [
    {
      name: 'Home',
      icon: 'home',
      link: '/'
    },
    {
      name: 'Profile',
      icon: 'profile',
      link: '/profile'
    },
    {
      name: 'Shop',
      icon: 'shop',
      link: '/shop'
    },
    {
      name: 'Collection',
      icon: 'collection',
      link: '/collection'
    },
    {
      name: 'Games',
      icon: 'games',
      link: '/games'
    },
    {
      name: 'Settings',
      icon: 'settings',
      link: '/settings'
    },
    {
      name: 'Logout',
      icon: 'logout',
      link: '/logout'
    }
  ];

  return (
    <div className="menu w-full h-full">
      <div className="w-full h-full bg-tapgate-gray text-tapgate-white shadow-lg border-l border-tapgate-black">
        <div className="relative w-full h-[20%] overflow-hidden bg-tapgate-black-400 flex justify-center items-center p-4">
          <div className="character-container absolute z-10 overflow-hidden">
            <Character id="menu-character" outfit={outfit?.code} />
          </div>
        </div>
        <div className="w-full h-[5%] flex justify-center items-center bg-tapgate-black font-black">
          {user?.username}
        </div>
        <div className="w-full h-[75%] p-4 font-semibold">
          <div className="flex flex-wrap gap-y-4">
            {menu.map((item, index) => (
              <div
                key={index}
                className={`w-full h-[50px] cursor-pointer hover:opacity-75 active:scale-95 rounded-md ${
                  activeLink(item.link) ? 'bg-tapgate-black' : ''
                } flex items-center`}
                onClick={() => menuClick(item.link)}>
                <div className="w-1/4 h-full flex justify-center items-center">
                  <Icon
                    className="text-tapgate-white"
                    name={activeLink(item.link) ? item.icon + 'Solid' : item.icon}
                  />
                </div>
                <div className="w-3/4">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
