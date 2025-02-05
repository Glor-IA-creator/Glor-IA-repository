import React, { useEffect, useState } from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import './HomeGeneral.css';

const HomeGeneral = () => {
  const [userName, setUserName] = useState('');
  const [lastLogin, setLastLogin] = useState('');

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No se encontró el token');
          return;
        }

        // Decodificar el token para obtener el nombre y la última fecha de inicio de sesión
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica el payload del token
        const nameFromToken = decodedToken.nombre; // Cambia esto según la estructura del token
        const lastLoginFromToken = decodedToken.lastLogin || 'Fecha desconocida'; // Cambia según tu token

        setUserName(nameFromToken);
        setLastLogin(lastLoginFromToken);
      } catch (error) {
        console.error('Error al obtener los datos del usuario desde el token:', error);
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
