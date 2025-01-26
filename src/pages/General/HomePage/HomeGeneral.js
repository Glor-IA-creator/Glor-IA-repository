import React from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import './HomeGeneral.css';

const HomeGeneral = () => {
  return (
    <div className="general-container">
      <div className="main-content">
        <GeneralNavbar />
        <div className="dashboard">
          <h1>Bienvenido, Administrador General</h1>
          <p>Esta es la vista principal para gestionar la plataforma como Administrador General.</p>
        </div>
      </div>
    </div>
  );
};

export default HomeGeneral;
