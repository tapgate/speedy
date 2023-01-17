import { createContext, useState, useContext } from 'react';
import pocketbase from '../utils/pocketbase';
import { NavigateFunction, useNavigate } from 'react-router-dom';

pocketbase.autoCancellation(false);

interface NavigatorContext {
  navigate: NavigateFunction;
  showMenu: boolean;
  toggleMenu: () => void;
}

const Context = createContext<NavigatorContext>({} as NavigatorContext);

const NavigatorProvider = ({ children }: any) => {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState<boolean>(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const exposed = {
    navigate,
    showMenu,
    toggleMenu
  };

  return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useNavigator = () => useContext(Context);

export default NavigatorProvider;
