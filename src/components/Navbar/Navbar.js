import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Necesario para redirigir
import './Navbar.css';
import danger from '../../assets/danger.svg';

const Navbar = ({ isSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar token y rol del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('rol');

    // Redirigir al login
    navigate('/');
  };

  return (
    <div className={`navbar ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <div className="navbar-content">
                <img src={danger} alt="danger" />
        <div className="logout-button-container">
          <button className="logout-button" onClick={handleLogout}>
            <FiLogOut style={{ marginRight: '5px' }} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
