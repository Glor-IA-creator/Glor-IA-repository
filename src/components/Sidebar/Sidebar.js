import React, { useState, useEffect } from 'react';
import {
  FaHome,
  FaComments,
  FaUser,
  FaHistory,
  // FaClipboardCheck
} from 'react-icons/fa';
import './Sidebar.css';
import Logo from '../../assets/Logo.svg';
import Side from '../../assets/Side.svg';

const Sidebar = ({ isOpen: initialIsOpen, toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(() => {
    // Leer el estado inicial desde localStorage
    const savedState = localStorage.getItem('sidebarState');
    return savedState === null ? initialIsOpen : JSON.parse(savedState);
  });

  // Actualizar localStorage cuando el estado cambia
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(isOpen));
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (toggleSidebar) {
      toggleSidebar(!isOpen);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={handleToggle} className="toggle-button">
        {isOpen ? '<' : '>'}
      </button>

      {/* Logo superior */}
      <div className="top-logo-container">
        <img
          src={Side}
          alt="Side"
          className={`top-logo ${isOpen ? 'show' : 'hide'}`}
        />
      </div>

      {/* Menú */}
      <div className="menu">
        <a href="/alumno/home" className="menu-item">
          <FaHome className="icon" />
          {isOpen && <span>Inicio</span>}
        </a>
        <a href="/alumno/chat" className="menu-item">
          <FaComments className="icon" />
          {isOpen && <span>Mi última sesión</span>}
        </a>
        <a href="/paciente" className="menu-item">
          <FaUser className="icon" />
          {isOpen && <span>Pacientes IA</span>}
        </a>
        <a href="/alumno/historial" className="menu-item">
          <FaHistory className="icon" />
          {isOpen && <span>Mi historial</span>}
        </a>
        {/*
        <a href="/alumno/evaluacion" className="menu-item">
          <FaClipboardCheck className="icon" />
          {isOpen && <span>Evaluación</span>}
        </a>
        */}
      </div>


      
      {/* Logo inferior */}
      <div className="bottom-section">
        <p className="project-text">Proyecto impulsado :</p>
        <div className="thin-line"></div>
        <div className="bottom-logo-container">
          <img
            src={Logo}
            alt="Logofoter"
            className={`go ${isOpen ? 'show' : 'hide'}`}
            style={{ width: '70%', paddingBottom: '10%' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
