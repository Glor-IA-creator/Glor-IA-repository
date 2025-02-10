import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import axios from 'axios';
import './HomeDocentes.css';

const API_URL = process.env.REACT_APP_API_URL;

const HomeDocentes = () => {
  const [userName, setUserName] = useState('');
  const [lastLogin, setLastLogin] = useState('Fecha desconocida');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No se encontró el token');
          return;
        }

        // ✅ Obtener datos del usuario desde la API en lugar del token
        const response = await axios.get(`${API_URL}/api/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { nombre, ultimo_acceso } = response.data;

        setUserName(nombre);

        // ✅ Formatear la fecha si existe
        if (ultimo_acceso) {
          const date = new Date(ultimo_acceso);
          const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
          setLastLogin(formattedDate);
        }

      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="home-docentes-container">
      <AdminNavbar />
      <div className="home-content">
        <h1>Hola {userName || 'Docente'}</h1>
        <p>Bienvenido nuevamente, no te veíamos desde el {lastLogin}</p>
      </div>
    </div>
  );
};

export default HomeDocentes;
