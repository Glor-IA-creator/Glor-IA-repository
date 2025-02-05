import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import HomePage from './pages/HomePage/HomePage';
import ChatPage from './pages/ChatPage/ChatPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import PatientPage from './pages/PatientPage/PatientPage';
import EvaluationPage from './pages/EvaluationPage/EvaluationPage';
import HomeDocentes from './pages/Docentes/HomeDocentes/HomeDocentes';
import AlumnosDocentes from './pages/Docentes/AlumnosDocentes/AlumnosDocentes';
import EstadisticasDocentes from './pages/Docentes/EstadisticasDocentes/EstadisticasDocentes';
import HomeGeneral from './pages/General/HomePage/HomeGeneral';
import EstadisticasGeneral from './pages/General/EstadisticasGeneral/EstadisticasGeneral';
import UsuariosGeneral from './pages/General/UsuariosGeneral/UsuariosGeneral';
import SeccionesGeneral from './pages/General/SeccionesGeneral/SeccionesGeneral';
import ProtectedRoute from './components/ProtectedRoute';

const RoutesComponent = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/alumno/home"
          element={
            <ProtectedRoute roles={['estudiante']}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumno/chat"
          element={
            <ProtectedRoute roles={['estudiante']}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumno/historial"
          element={
            <ProtectedRoute roles={['estudiante']}>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paciente"
          element={
            <ProtectedRoute roles={['estudiante']}>
              <PatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumno/evaluacion"
          element={
            <ProtectedRoute roles={['estudiante']}>
              <EvaluationPage />
            </ProtectedRoute>
          }
        />

        {/* Docentes */}
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute roles={['profesor']}>
              <HomeDocentes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/alumnos"
          element={
            <ProtectedRoute roles={['profesor']}>
              <AlumnosDocentes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/estadisticas"
          element={
            <ProtectedRoute roles={['profesor']}>
              <EstadisticasDocentes />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/general/home"
          element={
            <ProtectedRoute roles={['admin']}>
              <HomeGeneral />
            </ProtectedRoute>
          }
        />

        <Route
          path="/general/estadisticas"
          element={
            <ProtectedRoute roles={['admin']}>
              <EstadisticasGeneral />
            </ProtectedRoute>
          }
        />

        <Route
          path="/general/secciones"
          element={
            <ProtectedRoute roles={['admin']}>
              <SeccionesGeneral />
            </ProtectedRoute>
          }
        />

        <Route
          path="/general/usuarios"
          element={
            <ProtectedRoute roles={['admin']}>
              <UsuariosGeneral />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default RoutesComponent;
