import React, { useState, useEffect } from 'react';
import { FaFileDownload, FaEye, FaTimes } from 'react-icons/fa';
import './ChatHistoryModal.css';

const ChatHistoryModal = ({ chats, onClose }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatContent, setChatContent] = useState([]);
  const [assistantName, setAssistantName] = useState('');

  const handleDownload = (chat) => {
    const content = chatContent.map(msg => `${msg.role === 'user' ? 'Usuario' : assistantName}: ${msg.content}`).join('\n');
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `chat_${chat.id_thread}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
                        <FaEye className="icon" onClick={() => { setSelectedChat(chat.id_thread); fetchChatContent(chat.id_thread, chat.id_asistente); }} />
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
                  <div key={index} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
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
