import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <div className="colors hidden pointer-events-none">
      <div className="bg-tapgate-red text-tapgate-red"></div>
      <div className="bg-tapgate-green text-tapgate-green"></div>
      <div className="bg-tapgate-blue text-tapgate-blue"></div>
      <div className="bg-tapgate-yellow text-tapgate-yellow"></div>
      <div className="bg-tapgate-gray text-tapgate-gray"></div>
      <div className="bg-tapgate-black text-tapgate-black"></div>
      <div className="bg-tapgate-white text-tapgate-white"></div>

      <div className="bg-tapgate-red/75 text-tapgate-red/75"></div>
      <div className="bg-tapgate-green/75 text-tapgate-green/75"></div>
      <div className="bg-tapgate-blue/75 text-tapgate-blue/75"></div>
      <div className="bg-tapgate-yellow/75 text-tapgate-yellow/75"></div>
      <div className="bg-tapgate-gray/75 text-tapgate-gray/75"></div>
      <div className="bg-tapgate-black/75 text-tapgate-black/75"></div>
      <div className="bg-tapgate-white/75 text-tapgate-white/75"></div>

      <div className="bg-tapgate-red/50 text-tapgate-red/50"></div>
      <div className="bg-tapgate-green/50 text-tapgate-green/50"></div>
      <div className="bg-tapgate-blue/50 text-tapgate-blue/50"></div>
      <div className="bg-tapgate-yellow/50 text-tapgate-yellow/50"></div>
      <div className="bg-tapgate-gray/50 text-tapgate-gray/50"></div>
      <div className="bg-tapgate-black/50 text-tapgate-black/50"></div>
      <div className="bg-tapgate-white/50 text-tapgate-white/50"></div>
    </div>
    <App />
    <ToastContainer />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
