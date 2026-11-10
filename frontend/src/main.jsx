import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// El Client ID de Google es público (no es un secreto), pero se toma de VITE_GOOGLE_CLIENT_ID
// para poder cambiarlo por ambiente. El valor por defecto mantiene funcionando el build actual.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
    || '367751508872-rjkgo0i8e8natof9ucvod5ijer936a2e.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
