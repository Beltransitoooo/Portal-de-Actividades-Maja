import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { QAPortal } from './pages/QAPortal'; 
import { QADashboard } from './pages/QADashboard';
import { QASchedule } from './pages/QASchedule';
import { QAMyDay } from './pages/QAMyDay';
import { QATeam } from './pages/QATeam';
import { ResetPassword } from './pages/ResetPassword';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />
        
        {/* Restablecer contraseña con el enlace que comparte un administrador (público) */}
        <Route path="/restablecer" element={<ResetPassword />} />

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

        {/* Mi día: actividades de hoy y avisos */}
        <Route 
          path="/qa/mi-dia" 
          element={
            <ProtectedRoute>
              <QAMyDay />
            </ProtectedRoute>
          } 
        />

        {/* Equipo (administradores): enlaces de restablecimiento y líderes técnicos */}
        <Route 
          path="/qa/equipo" 
          element={
            <ProtectedRoute>
              <QATeam />
            </ProtectedRoute>
          } 
        />

        {/* Cronograma de QA (línea de tiempo mensual) */}
        <Route 
          path="/qa/cronograma" 
          element={
            <ProtectedRoute>
              <QASchedule />
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