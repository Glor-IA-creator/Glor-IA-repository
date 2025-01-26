import React from 'react';
import { FaFileAlt, FaComments, FaClipboard } from 'react-icons/fa';
import './PatientCard.css';

const PatientCard = ({ id, name, age, location, image, onStartConversation }) => {
  return (
    <div className="patient-card">
      <img src={image} alt={name} className="patient-image" />
      <h3>{name}</h3>
      <p>Edad: {age} años</p>
      <p>{location}</p>
      <div className="patient-actions">
        <button className="action-button">
          <FaFileAlt className="button-icon" /> Ver Presentación
        </button>
        <button
          className="action-button"
          onClick={() => onStartConversation(id)} // Llama al evento con el ID del paciente
        >
          <FaComments className="button-icon" /> Iniciar conversación
        </button>
        <button className="action-button">
          <FaClipboard className="button-icon" /> Ver ficha clínica
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
