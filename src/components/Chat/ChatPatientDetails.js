// src/components/ChatPatientDetails/ChatPatientDetails.js
import React from 'react';
import './ChatPatientDetails.css';

const ChatPatientDetails = ({ isVisible, assistant }) => {
  const handleNewConversation = async () => {
    if (!assistant?.id) {
      console.error('El ID del asistente no está definido:', assistant);
      alert('No se puede iniciar una nueva conversación porque falta información del asistente.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Crear un nuevo hilo en el backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/crear-hilo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ patientId: assistant.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear un nuevo hilo');
      }

      console.log('Nuevo hilo creado:', data);

      // Verificar si los datos del hilo son correctos
      if (!data.threadId || !data.patientId) {
        console.error('Datos del hilo incompletos:', data);
        alert('No se pudo iniciar la nueva conversación. Intente nuevamente.');
        return;
      }

      // Recargar el chat con el nuevo hilo
      window.location.href = `/alumno/chat?threadId=${data.threadId}&assistantId=${data.patientId}&name=${encodeURIComponent(
        data.name
      )}&image=${encodeURIComponent(data.image)}&description=${encodeURIComponent(data.description)}`;
    } catch (error) {
      console.error('Error al iniciar una nueva conversación:', error);
      alert('No se pudo iniciar una nueva conversación. Intente nuevamente.');
    }
  };

  return (
    <div className={`chat-patient-details ${isVisible ? 'visible' : ''}`}>
      <div className="chat-patient-details-header">
        <img
          src={assistant?.image || 'https://via.placeholder.com/80'}
          alt={assistant?.name || 'Asistente'}
          className="patient-photo"
        />
        <h3>{assistant?.name || 'Nombre no disponible'}</h3>
        <p>{assistant?.description || 'Descripción no disponible'}</p>
      </div>
      <div className="chat-patient-details-actions">
        <button>Presentación Paciente</button>
        <button>Llenar Ficha</button>
        <button onClick={handleNewConversation}>Iniciar Nueva Conversación</button>
        <button>Historial de Fichas</button>
      </div>
    </div>
  );
};

export default ChatPatientDetails;
