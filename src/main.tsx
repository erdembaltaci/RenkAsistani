import '@fontsource-variable/inter';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createServices } from './compositionRoot';
import { ServicesProvider } from './hooks/ServicesProvider';
import { registerServiceWorker } from './registerServiceWorker';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root elemanı bulunamadı');
}

createRoot(root).render(
  <StrictMode>
    <ServicesProvider services={createServices()}>
      <App />
    </ServicesProvider>
  </StrictMode>,
);

registerServiceWorker();
