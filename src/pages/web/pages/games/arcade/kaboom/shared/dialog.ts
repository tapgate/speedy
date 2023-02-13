import { ToastOptions } from 'react-toastify';

export const dialogOpts = {
  position: 'bottom-center',
  type: 'info',
  autoClose: false,
  closeButton: false,
  closeOnClick: false,
  draggable: false,
  icon: false,
  style: {
    fontSize: '1.5rem',
    fontFamily: 'Minecraft',
    height: '10vh',
    width: '50vw',
    marginLeft: '-15vw',
    marginRight: '-25vw',
    letterSpacing: '0.15rem',
    border: '4px solid #000',
    color: '#000'
  }
} as ToastOptions;
