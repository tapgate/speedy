import { useNavigator } from '../context/navigation';
import { Icons } from './icons';

function Navbar() {
  const { showMenu, toggleMenu } = useNavigator();

  return (
    <div className="navbar w-full h-full">
      <div className="w-full h-full flex justify-between items-center px-4">
        <div className="logo flex items-center">
          <div className="">
            <img
              className="w-full h-[25px] object-cover"
              src="/images/logo-alt.png"
              alt="TapGate"
            />
          </div>
          <div className="ml-2 text-tapgate-white">
            <img className="h-[25px]" src="/images/logo-text-alt.png" alt="TapGate" />
          </div>
        </div>

        <div
          className="w-8 h-8 flex items-center text-tapgate-white cursor-pointer hover:opacity-75"
          onClick={() => toggleMenu()}>
          <div
            className={`ease-in duration-300 ${
              showMenu ? 'bg-tapgate-black-600/50 p-2 rounded' : ''
            }`}>
            {Icons.Hamburger}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
