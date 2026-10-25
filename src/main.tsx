import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';
import { App } from './App';
import { StoreProvider } from './store';
import './styles/base.css';
import './styles/layout.css';
import './styles/pages.css';

// Aberto com dois cliques (file://) não há servidor para as rotas, então elas vão depois do "#"
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <StoreProvider>
        <App />
      </StoreProvider>
    </Router>
  </StrictMode>,
);
