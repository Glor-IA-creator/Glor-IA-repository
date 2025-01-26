import React from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Necesario para redirigir
import Logo from '../../assets/LogoW.svg';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar token y rol del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('rol');

    // Redirigir al login
    navigate('/');
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        <img src={Logo} alt="Logo" className="navbar-logo" />
      </div>
      <div className="navbar-center">
        <a href="/admin/home" className="navbar-link">Home</a>
        <a href="/admin/alumnos" className="navbar-link">Alumnos</a>
        <a href="/admin/estadisticas" className="navbar-link">Estadísticas</a>
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

export default AdminNavbar;
