import React, { useEffect, useState, useCallback } from 'react';
import { FaFileMedical } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './HistoryTable.css';

const HistoryTable = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/historial`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar el historial de sesiones');
      }

      const data = await response.json();
      setHistoryData(data);
    } catch (err) {
      console.error('Error al cargar el historial:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDates = useCallback(async (assistant) => {
    if (!assistant.id) {
      console.error('El ID del asistente no está definido:', assistant);
      alert('No se pudo cargar las fechas porque falta información del asistente.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/chat/obtener-fechas?assistantId=${assistant.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar las fechas de los hilos');
      }

      const data = await response.json();
      setModalData(data.dates);
      setSelectedAssistant(assistant); // Guardar los datos completos del asistente seleccionado
      setModalVisible(true);
    } catch (err) {
      console.error('Error al cargar las fechas de los hilos:', err.message);
      alert('No se pudieron cargar las fechas de los hilos. Intente nuevamente.');
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return <p className="loading-message">Cargando historial...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  return (
    <div className="table-container">
      <h2>Historial Sesiones Terapéuticas</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th className="center-align">Interacciones</th>
            <th className="center-align">Fichas</th>
          </tr>
        </thead>
        <tbody>
          {historyData.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="name-cell">
                  <img
                    src={item.image || 'https://via.placeholder.com/40'}
                    alt={item.name || 'Asistente'}
                    className="profile-image"
                  />
                  <span className="name-text">{item.name || 'Desconocido'}</span>
                </div>
              </td>
              <td className="center-align">{item.interactions || 0}</td>
              <td className="center-align">
                <FaFileMedical
                  className="file-icon"
                  onClick={() =>
                    fetchThreadDates({
                      id: item.id,
                      name: item.name,
                      image: item.image,
                      description: item.description,
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalVisible && (
        <Modal onClose={() => setModalVisible(false)}>
          <h3>Fichas Clínicas de {selectedAssistant.name}</h3>
          <ul className="modal-list">
            {modalData.map((date, index) => (
              <li key={index} className="modal-list-item">
                {date.date}{' '}
                <FaFileMedical
                  className="file-icon-small"
                  onClick={() =>
                    navigate('/alumno/chat', {
                      state: {
                        assistant: {
                          id: selectedAssistant.id,
                          name: selectedAssistant.name,
                          image: selectedAssistant.image,
                          description: selectedAssistant.description,
                        },
                        threadId: date.id,
                      },
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
};

export default HistoryTable;
