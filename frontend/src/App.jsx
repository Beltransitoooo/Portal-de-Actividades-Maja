import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { QADashboard } from './pages/QADashboard'; 
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública unificada */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta Privada: Dashboard Principal */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Ruta Privada: Módulo QA */}
        <Route 
          path="/qa" 
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