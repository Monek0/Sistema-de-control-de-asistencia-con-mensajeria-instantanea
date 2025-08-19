import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import AttendancePage from './pages/AttendancePage';
import ProtectedRoute from './components/ProtectedRoute';
import ReportsPage from './pages/ReportsPage';
import AtrasosPage from './pages/AtrasosPage';
import EstudiantesPage from './pages/EstudiantesPage';
import ServiceSuspendedPage from './components/ServiceSuspendedPage'; // Ajusta la ruta si lo pusiste en pages/

function App() {
  // Variable para controlar si el servicio está suspendido
  const isServiceSuspended = false; // Cambia a false cuando quieras activar el servicio

  // Si el servicio está suspendido, muestra solo la página de suspensión
  if (isServiceSuspended) {
    return <ServiceSuspendedPage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage/></ProtectedRoute>} />
        <Route path="/atrasos" element={<ProtectedRoute><AtrasosPage /></ProtectedRoute>} />
        <Route path="/estudiantes" element={<ProtectedRoute><EstudiantesPage/></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;