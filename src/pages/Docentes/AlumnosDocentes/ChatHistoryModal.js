import React, { useState, useEffect, useCallback } from 'react';
import { FaFileDownload, FaEye, FaTimes } from 'react-icons/fa';
import pdfMake from 'pdfmake/build/pdfmake';
import { vfs } from 'pdfmake/build/vfs_fonts'; // VFS con fuente Roboto por defecto
import './ChatHistoryModal.css';

// Asignamos las fuentes virtuales (Roboto) que vienen por defecto
pdfMake.vfs = vfs;

const TZ = 'America/Santiago';

const getChileDateKey = (iso) =>
  new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ }).format(new Date(iso));

const formatDateLabel = (dateKey) => {
  const todayKey = getChileDateKey(new Date().toISOString());
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const yesterdayKey = getChileDateKey(yd.toISOString());
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const label = `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  if (dateKey === todayKey) return `Hoy — ${label}`;
  if (dateKey === yesterdayKey) return `Ayer — ${label}`;
  return label;
};

const groupChatsByDate = (chats, statsMap = {}) => {
  const map = new Map();
  chats.forEach(chat => {
    const stats = statsMap[chat.id_thread];
    const dateSource = stats?.firstTime
      ? new Date(stats.firstTime * 1000).toISOString()
      : chat.fecha_creacion;
    const key = getChileDateKey(dateSource);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(chat);
  });
  return Array.from(map.entries());
};

const fetchChatMessagesApi = async (threadId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/chat/obtener-mensajes?threadId=${threadId}`,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
  );
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/?expired=1';
    throw new Error('auth');
  }
  if (response.status === 503) {
    throw new Error('thread_unavailable');
  }
  if (!response.ok) {
    throw new Error('api_error');
  }
  return response.json();
};

const ChatHistoryModal = ({ chats, onClose, studentName }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatContent, setChatContent] = useState([]);
  const [assistantName, setAssistantName] = useState('');
  const [pdfUserName, setPdfUserName] = useState('Usuario');
  const [chatStats, setChatStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats for all chats on mount
  useEffect(() => {
    const fetchAllStats = async () => {
      setLoadingStats(true);
      const stats = {};
      await Promise.all(chats.map(async (chat) => {
        try {
          const data = await fetchChatMessagesApi(chat.id_thread);
          const msgs = data.messages || [];
          if (msgs.length > 0) {
            const times = msgs.map(m => m.created_at);
            stats[chat.id_thread] = {
              msgCount: msgs.length,
              firstTime: Math.min(...times),
              lastTime: Math.max(...times),
            };
          }
        } catch (e) { /* skip */ }
      }));
      setChatStats(stats);
      setLoadingStats(false);
    };
    if (chats.length > 0) fetchAllStats();
    else setLoadingStats(false);
  }, [chats]);

  // Filter out empty chats and group by date
  const nonEmptyChats = chats.filter(c => chatStats[c.id_thread]);
  const dateGroups = groupChatsByDate(nonEmptyChats, chatStats);

  // Close modal on ESC key
  const handleClose = useCallback(() => {
    if (selectedChat) {
      setSelectedChat(null);
    } else {
      onClose();
    }
  }, [selectedChat, onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  // Al previsualizar, obtenemos los mensajes y la info (assistant y user)
  const fetchChatContent = async (threadId) => {
    try {
      const data = await fetchChatMessagesApi(threadId);
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
      if (error.message === 'auth') return;
      console.error('Error al obtener los mensajes del chat:', error);
      const msg = error.message === 'thread_unavailable'
        ? 'No se pudo cargar este historial. El hilo de conversación ya no está disponible.'
        : 'Error al cargar el contenido del chat.';
      setChatContent([{ sender: 'error', content: msg }]);
    }
  };

  // Función para descargar el PDF usando pdfmake
  const handleDownload = async (chat) => {
    try {
      const data = await fetchChatMessagesApi(chat.id_thread);
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
      const dateStr = dateObj.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }).replace(/\//g, '-');

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
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container">
        <FaTimes className="close-icon" onClick={onClose} />
        <div className="modal-content">
          <h3>Historial Sesiones</h3>
          <div className="table-container">
            <table className="history-table">
              <thead className="sticky-header">
                <tr>
                  <th>Inicio</th>
                  <th>Término</th>
                  <th>Msgs</th>
                  <th>Ver</th>
                  <th>Descargar</th>
                </tr>
              </thead>
              <tbody>
                {loadingStats ? (
                  <tr>
                    <td colSpan="5" className="no-data">Cargando...</td>
                  </tr>
                ) : dateGroups.length > 0 ? (
                  dateGroups.map(([dateKey, dateSessions]) => (
                    <React.Fragment key={dateKey}>
                      <tr className="date-separator">
                        <td colSpan="5" style={{ padding: '10px 8px 4px', fontWeight: 600, fontSize: '13px', color: '#555', borderBottom: '1px solid #e5e5e5' }}>
                          {formatDateLabel(dateKey)}
                        </td>
                      </tr>
                      {dateSessions.map((chat) => {
                        const stats = chatStats[chat.id_thread];
                        return (
                          <tr key={chat.id_thread}>
                            <td>{stats?.firstTime ? new Date(stats.firstTime * 1000).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: TZ }) : '—'}</td>
                            <td>{stats?.lastTime ? new Date(stats.lastTime * 1000).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: TZ }) : '—'}</td>
                            <td>{stats?.msgCount || 0}</td>
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
                        );
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
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
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedChat(null); }}>
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
                    {msg.created_at && (
                      <span className="msg-time">
                        {new Date(msg.created_at * 1000).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: TZ })}
                      </span>
                    )}
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
