// src/components/Sidebar/Sidebar.js
import React, { useState, useEffect } from 'react';
import { FaHome, FaComments, FaUser, FaHistory, FaClipboardCheck } from 'react-icons/fa';
import './Sidebar.css';
import Logo from '../../assets/Logo.svg';

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
    toggleSidebar && toggleSidebar(!isOpen); // Llamar al callback si se proporciona
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={handleToggle} className="toggle-button">
        {isOpen ? '←' : '→'}
      </button>
      <div className="logo-container">
        <img src={Logo} alt="Logo" className={`logo ${isOpen ? 'show' : 'hide'}`} />
      </div>
      <div className="menu">
        <a href="/alumno/home">
          <FaHome className="icon" />
          {isOpen && <span>Inicio</span>}
        </a>
        <a href="/alumno/chat">
          <FaComments className="icon" />
          {isOpen && <span>Conversación</span>}
        </a>
        <a href="/paciente">
          <FaUser className="icon" />
          {isOpen && <span>Paciente IA</span>}
        </a>
        <a href="/alumno/historial">
          <FaHistory className="icon" />
          {isOpen && <span>Historial</span>}
        </a>
        <a href="/alumno/evaluacion">
          <FaClipboardCheck className="icon" />
          {isOpen && <span>Evaluación</span>}
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
