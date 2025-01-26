// src/pages/EvaluationPage/EvaluationPage.js
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import './EvaluationPage.css';

const EvaluationPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className={`evaluation-page-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content-container">
        <Navbar />
        <div className="content">
          <h1>Evaluación final</h1>
          <p className="evaluation-description">
            Recuerda que esta evaluación tiene una duración de 60 minutos y debe realizarse de manera continua, sin pausas ni interrupciones, ya que esto podría invalidar o afectar los resultados. Solo tienes una oportunidad para completar esta evaluación, por lo que es importante que te prepares adecuadamente y asegures un entorno tranquilo y libre de distracciones antes de comenzar.
          </p>
          <h2>Antes de comenzar recuerda</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <p className="step-text">Tendrás un paciente elegido al azar</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <p className="step-text">Un total de 60 minutos para finalizar</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <p className="step-text">Sólo puedes realizar una evaluación final</p>
            </div>
          </div>
          <button className="start-evaluation-button">Iniciar evaluación</button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
