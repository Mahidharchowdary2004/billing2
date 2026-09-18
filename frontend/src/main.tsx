import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { StoreProvider } from './state/store';
import { UiProvider } from './state/ui';
import { AuthProvider } from './state/auth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <UiProvider>
          <App />
        </UiProvider>
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>
);
