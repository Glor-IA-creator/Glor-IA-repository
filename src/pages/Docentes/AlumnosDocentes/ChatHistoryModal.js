import React, { useState } from 'react';
import { FaFileDownload, FaEye, FaTimes } from 'react-icons/fa';
import pdfMake from 'pdfmake/build/pdfmake';
import { vfs } from 'pdfmake/build/vfs_fonts'; // VFS con fuente Roboto por defecto
import './ChatHistoryModal.css';

// Asignamos las fuentes virtuales (Roboto) que vienen por defecto
pdfMake.vfs = vfs;

const ChatHistoryModal = ({ chats, onClose, studentName }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatContent, setChatContent] = useState([]);
  const [assistantName, setAssistantName] = useState('');
  // Se prioriza studentName; en su defecto se obtiene el nombre desde la API en data.user.name
  const [pdfUserName, setPdfUserName] = useState('Usuario');

  // Función genérica para obtener los mensajes y la info asociada del API
  const fetchChatMessages = async (threadId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/chat/obtener-mensajes?threadId=${threadId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.json();
  };

  // Al previsualizar, obtenemos los mensajes y la info (assistant y user)
  const fetchChatContent = async (threadId) => {
    try {
      const data = await fetchChatMessages(threadId);
      if (data.messages && data.messages.length > 0) {
        // Invertimos para que se muestren en orden natural (primeros primero)
        const reversedMessages = data.messages.slice().reverse();
        setChatContent(reversedMessages);
      } else {
        setChatContent([{ sender: 'info', content: 'No hay contenido disponible.' }]);
      }

      // Asignamos el nombre del asistente según lo recibido desde la API
      setAssistantName(data.assistant?.name || 'Asistente');
      // Se prioriza studentName; si no, se utiliza el nombre del usuario recibido en data.user
      setPdfUserName(studentName || data.user?.name || 'Usuario');
    } catch (error) {
      console.error('Error al obtener los mensajes del chat:', error);
      setChatContent([{ sender: 'error', content: 'Error al cargar el contenido del chat.' }]);
    }
  };

  // Función para descargar el PDF usando pdfmake
  const handleDownload = async (chat) => {
    try {
      const data = await fetchChatMessages(chat.id_thread);
      let messages = [];
      if (data.messages && data.messages.length > 0) {
        messages = data.messages.slice().reverse();
      } else {
        messages = [{ sender: 'info', content: 'No hay contenido disponible.' }];
      }

      // Extraemos los nombres desde la respuesta del API
      const currentAssistantName = data.assistant?.name || 'Asistente';
      const currentPdfUserName = studentName || data.user?.name || 'Usuario';

      // Convertir la fecha a un formato legible (dd-mm-yyyy)
      const dateObj = new Date(chat.fecha_creacion);
      const dateStr = dateObj.toLocaleDateString().replace(/\//g, '-');

      // Nombre del archivo
      const fileName = `chat_${currentPdfUserName}_${currentAssistantName}_${dateStr}.pdf`;

      // Definición del documento para pdfmake
      const docDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 60, 40, 60],
        content: [
          { text: `Usuario: ${currentPdfUserName}`, style: 'header', margin: [0, 0, 0, 10] },
          { text: `Chat con ${currentAssistantName}`, style: 'subheader', margin: [0, 0, 0, 20] },
          ...messages.map((msg) => ({
            text: `${msg.sender}: ${msg.content}`,
            margin: [0, 5, 0, 5],
            fontSize: 12,
          })),
        ],
        styles: {
          header: {
            fontSize: 15,
            bold: true,
          },
          subheader: {
            fontSize: 13,
            bold: true,
          },
        },
        defaultStyle: {
          font: 'Roboto', // Fuente por defecto (no soporta todos los emojis)
        },
      };

      // Generar y descargar el PDF
      pdfMake.createPdf(docDefinition).download(fileName);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
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
                            fetchChatContent(chat.id_thread);
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
                    <td colSpan="3" className="no-data">
                      No hay historial disponible
                    </td>
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
                    className={`chat-bubble ${
                      msg.sender === (studentName || pdfUserName) ? 'user' : 'assistant'
                    }`}
                  >
                    <strong>{msg.sender}:</strong> {msg.content}
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
