import React, { useEffect, useState } from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import axios from 'axios';
import './HomeGeneral.css';

const API_URL = process.env.REACT_APP_API_URL;

const HomeGeneral = () => {
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

        // ✅ Obtener datos reales del usuario desde la API
        const response = await axios.get(`${API_URL}/api/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { nombre, ultimo_acceso } = response.data;

        setUserName(nombre);

        // ✅ Si existe `ultimo_acceso`, formatearlo
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
    <div className="home-genelar-container">
      <GeneralNavbar />
      <div className="home-content">
        <h1>Hola {userName || 'Admin'}</h1>
        <p>Bienvenido nuevamente, no te veíamos desde el {lastLogin}</p>
      </div>
    </div>
  );
};

export default HomeGeneral;
