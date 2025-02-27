import React from 'react';
import { FaFileAlt, FaComments, FaPhotoVideo } from 'react-icons/fa';
import './PatientCard.css';

const PatientCard = ({ id, name, age, location, image, onStartConversation, onContinueConversation, onViewImage }) => {
  return (
    <div className="patient-card">
      <img src={image} alt={name} className="patient-image" />
      <h3>{name}</h3>
      <p>Edad: {age} años</p>
      <p>{location}</p>
      <div className="patient-actions">
        <button className="action-button" onClick={onContinueConversation}>
          <FaFileAlt className="button-icon" /> Retomar conversación
        </button>
        <button className="action-button" onClick={() => onStartConversation(id)}>
          <FaComments className="button-icon" /> Iniciar conversación
        </button>
        <button className="action-button" onClick={onViewImage}>
          <FaPhotoVideo className="button-icon" /> Ver foto del paciente
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
