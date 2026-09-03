import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google'; // <-- 1. Importar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolver con tu Client ID */}
    <GoogleOAuthProvider clientId="367751508872-rjkgo0i8e8natof9ucvod5ijer936a2e.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);