import React, { useState } from 'react';
import { FaFileDownload, FaEye, FaTimes } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import './ChatHistoryModal.css';

const ChatHistoryModal = ({ chats, onClose, studentName }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatContent, setChatContent] = useState([]);
  const [assistantName, setAssistantName] = useState('');

  // Función para descargar en PDF con nombre: chat_<Estudiante>_<Asistente>_<Fecha>.pdf
  const handleDownload = (chat) => {
    // Obtenemos el nombre del usuario desde localStorage (o usa un valor por defecto)
    const userName = localStorage.getItem('username') || 'Usuario';
  
    // Convertimos la fecha de creación a un formato legible (dd-mm-yyyy)
    const dateObj = new Date(chat.fecha_creacion);
    const dateStr = dateObj.toLocaleDateString().replace(/\//g, '-');
  
    // Inicializamos jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });
  
    // Configuración de márgenes y dimensiones
    const x = 40;
    let y = 40;
    const maxWidth = 500;
    const lineHeight = 16;
  
    // Iteramos sobre cada mensaje para dibujar su fondo y texto
    chatContent.forEach((msg) => {
      const sender = msg.role === 'user' ? 'Usuario:' : assistantName + ':';
      const text = sender + ' ' + msg.content;
      const lines = doc.splitTextToSize(text, maxWidth);
      const blockHeight = lines.length * lineHeight + 4;
  
      // Seleccionar color de fondo pastel según el rol
      if (msg.role === 'user') {
        doc.setFillColor(173, 216, 230); // Azul pastel
      } else {
        doc.setFillColor(255, 182, 193); // Rosa pastel
      }
  
      // Dibujar el rectángulo de fondo
      doc.rect(x - 2, y - 2, maxWidth + 4, blockHeight, 'F');
      // Establecer el color del texto en negro y dibujar el mensaje
      doc.setTextColor(0, 0, 0);
      doc.text(lines, x, y);
  
      // Incrementar la posición y para el siguiente bloque, con un margen
      y += blockHeight + 10;
    });
  
    // Generar el nombre del archivo: chat_<usuario>_<asistente>_<fecha>.pdf
    const fileName = `chat_${userName}_${assistantName}_${dateStr}.pdf`;
    doc.save(fileName);
  };
  
  // Función para obtener el contenido de cada chat
  const fetchChatContent = async (threadId, assistantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/obtener-mensajes?threadId=${threadId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        setChatContent(data.messages);
      } else {
        setChatContent([{ role: 'info', content: 'No hay contenido disponible.' }]);
      }
      // Suponemos que en "chats" tienes la propiedad "assistantName"
      // Si no existe, usamos "Asistente" por defecto
      setAssistantName(chats.find(chat => chat.id_thread === threadId)?.assistantName || 'Asistente');
    } catch (error) {
      console.error('Error al obtener los mensajes del chat:', error);
      setChatContent([{ role: 'error', content: 'Error al cargar el contenido del chat.' }]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <FaTimes className="close-icon" onClick={onClose} />
        <div className="modal-content">
          <h3>Historial Sesiones</h3>
          <div className="table-container">
            <table className="history-table">
              <thead className="sticky-header">
                <tr>
                  <th>Fecha</th>
                  <th>Ver</th>
                  <th>Descargar</th>
                </tr>
              </thead>
              <tbody>
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <tr key={chat.id_thread}>
                      <td>{new Date(chat.fecha_creacion).toLocaleDateString()}</td>
                      <td>
                        <FaEye
                          className="icon"
                          onClick={() => {
                            setSelectedChat(chat.id_thread);
                            fetchChatContent(chat.id_thread, chat.id_asistente);
                          }}
                        />
                      </td>
                      <td>
                        <FaFileDownload className="icon" onClick={() => handleDownload(chat)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-data">No hay historial disponible</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedChat && (
        <div className="modal-overlay">
          <div className="modal-container chat-modal">
            <FaTimes className="close-icon" onClick={() => setSelectedChat(null)} />
            <div className="modal-content chat-view">
              <h3>Historial Sesiones</h3>
              <div className="chat-box">
                {chatContent.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
                  >
                    <strong>{msg.role === 'user' ? 'Usuario' : assistantName}:</strong> {msg.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryModal;
