import React from 'react';
import ReactDOM from 'react-dom/client';
import RegressionPlot from './components/index.js'; // Importa tu componente

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RegressionPlot />
  </React.StrictMode>
);