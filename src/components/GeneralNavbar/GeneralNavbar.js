import React from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Necesario para redirigir
import Logo from '../../assets/LogoW.svg';
import './GeneralNavbar.css';

const GeneralNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar token y rol del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('rol');

    // Redirigir al login
    navigate('/');
  };

  return (
    <nav className="general-navbar">
      <div className="navbar-left">
        <img src={Logo} alt="Logo" className="navbar-logo" />
      </div>
      <div className="navbar-center">
        <a href="/general/home" className="navbar-link">Home</a>
        <a href="/general/usuarios" className="navbar-link">Usuarios</a>
        <a href="/general/secciones" className="navbar-link">Secciones</a>
        <a href="/general/estadisticas" className="navbar-link">Estadisticas</a>
      </div>
      <div className="navbar-right">
        <FaUserCircle className="navbar-icon" />
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" /> Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default GeneralNavbar;
