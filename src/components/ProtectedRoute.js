import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, roles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Inicializa como `null` para manejar el estado inicial
  const [userRole, setUserRole] = useState(null);

  // Base URL del backend desde las variables de entorno
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_URL}/api/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setIsAuthenticated(true);
          setUserRole(response.data.rol); // Asigna directamente el rol recibido
        })
        .catch(() => {
          setIsAuthenticated(false);
          localStorage.removeItem('token'); // Elimina el token inválido
        });
    } else {
      setIsAuthenticated(false);
    }
  }, [API_URL]);

  // Mientras verifica, no muestra nada
  if (isAuthenticated === null) {
    return null; // Puedes agregar un spinner si prefieres
  }

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Si el rol no está permitido, redirige al login
  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
