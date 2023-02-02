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

      <div className="bg-blue border-blue text-blue"></div>
      <div className="bg-red border-red text-red"></div>
      <div className="bg-green border-green text-green"></div>
      <div className="bg-yellow border-yellow text-yellow"></div>
      <div className="bg-purple border-purple text-purple"></div>
      <div className="bg-pink border-pink text-pink"></div>
      <div className="bg-orange border-orange text-orange"></div>
      <div className="bg-gray border-gray text-gray"></div>

      <div className="bg-blue-100 border-blue-100 text-blue-100"></div>
      <div className="bg-red-100 border-red-100 text-red-100"></div>
      <div className="bg-green-100 border-green-100 text-green-100"></div>
      <div className="bg-yellow-100 border-yellow-100 text-yellow-100"></div>
      <div className="bg-purple-100 border-purple-100 text-purple-100"></div>
      <div className="bg-pink-100 border-pink-100 text-pink-100"></div>
      <div className="bg-orange-100 border-orange-100 text-orange-100"></div>
      <div className="bg-gray-100 border-gray-100 text-gray-100"></div>

      <div className="bg-blue-500 border-blue-500 text-blue-500"></div>
      <div className="bg-red-500 border-red-500 text-red-500"></div>
      <div className="bg-green-500 border-green-500 text-green-500"></div>
      <div className="bg-yellow-500 border-yellow-500 text-yellow-500"></div>
      <div className="bg-purple-500 border-purple-500 text-purple-500"></div>
      <div className="bg-pink-500 border-pink-500 text-pink-500"></div>
      <div className="bg-orange-500 border-orange-500 text-orange-500"></div>
      <div className="bg-gray-500 border-gray-500 text-gray-500"></div>
    </div>
    <App />
    <ToastContainer />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
