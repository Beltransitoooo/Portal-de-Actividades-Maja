import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { QAPortal } from './pages/QAPortal'; 
import { QADashboard } from './pages/QADashboard'; 
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />
        
        {/* Selección de Módulo post-login */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Portal Principal de QA (Rendimiento) */}
        <Route 
          path="/qa" 
          element={
            <ProtectedRoute>
              <QAPortal />
            </ProtectedRoute>
          } 
        />

        {/* Gestor de Actividades de QA (Calendario) */}
        <Route 
          path="/qa/actividades" 
          element={
            <ProtectedRoute>
              <QADashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;