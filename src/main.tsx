import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProviderWithConvex } from './components/ClerkProviderWithConvex';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProviderWithConvex>
      <App />
    </ClerkProviderWithConvex>
  </StrictMode>
);
