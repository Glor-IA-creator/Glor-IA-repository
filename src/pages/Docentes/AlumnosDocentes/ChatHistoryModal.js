import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaFileDownload, FaEye, FaTimes } from 'react-icons/fa';
import pdfMake from 'pdfmake/build/pdfmake';
import { vfs } from 'pdfmake/build/vfs_fonts';
import './ChatHistoryModal.css';

pdfMake.vfs = vfs;

const TZ = 'America/Santiago';
const SESSION_GAP = 30 * 60; // 30 min in seconds

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

const splitIntoSessions = (messages, threadId, fechaCreacion) => {
  if (!messages || messages.length === 0) {
    return [{ id: `${threadId}__0`, id_thread: threadId, firstTime: null, lastTime: null, msgCount: 0, msgRange: [0, 0], fecha_creacion: fechaCreacion }];
  }

  const sorted = [...messages].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  const sessions = [];
  let sessionStart = 0;

  for (let i = 1; i <= sorted.length; i++) {
    const isGap = i < sorted.length && sorted[i].created_at && sorted[i - 1].created_at &&
      (sorted[i].created_at - sorted[i - 1].created_at) > SESSION_GAP;
    const isEnd = i === sorted.length;

    if (isGap || isEnd) {
      const sessionMsgs = sorted.slice(sessionStart, i);
      const times = sessionMsgs.map(m => m.created_at).filter(Boolean);
      sessions.push({
        id: `${threadId}__${sessions.length}`,
        id_thread: threadId,
        firstTime: times.length > 0 ? Math.min(...times) : null,
        lastTime: times.length > 0 ? Math.max(...times) : null,
        msgCount: sessionMsgs.length,
        msgRange: [sessionStart, i],
        fecha_creacion: fechaCreacion,
      });
      sessionStart = i;
    }
  }

  return sessions;
};

const groupSessionsByDate = (sessions) => {
  const map = new Map();
  sessions.forEach(s => {
    const dateSource = s.firstTime
      ? new Date(s.firstTime * 1000).toISOString()
      : s.fecha_creacion;
    const key = getChileDateKey(dateSource);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
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
  const [selectedSession, setSelectedSession] = useState(null);
  const [chatContent, setChatContent] = useState([]);
  const [assistantName, setAssistantName] = useState('');
  const [pdfUserName, setPdfUserName] = useState('Usuario');
  const [sessions, setSessions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const msgCache = useRef({});

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoadingStats(true);
      const allSessions = [];

      for (let i = 0; i < chats.length; i += 5) {
        const batch = chats.slice(i, i + 5);
        await Promise.all(batch.map(async (chat) => {
          try {
            const data = await fetchChatMessagesApi(chat.id_thread);
            const msgs = data.messages || [];
            const sorted = [...msgs].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
            msgCache.current[chat.id_thread] = { messages: sorted, assistant: data.assistant, user: data.user };
            const threadSessions = splitIntoSessions(sorted, chat.id_thread, chat.fecha_creacion);
            allSessions.push(...threadSessions);
          } catch (e) {
            allSessions.push({
              id: `${chat.id_thread}__0`,
              id_thread: chat.id_thread,
              firstTime: null,
              lastTime: null,
              msgCount: 0,
              msgRange: [0, 0],
              fecha_creacion: chat.fecha_creacion,
            });
          }
        }));
      }

      setSessions(allSessions);
      setLoadingStats(false);
    };
    if (chats.length > 0) fetchAllStats();
    else setLoadingStats(false);
  }, [chats]);

  const dateGroups = groupSessionsByDate(sessions);

  const handleClose = useCallback(() => {
    if (selectedSession) {
      setSelectedSession(null);
    } else {
      onClose();
    }
  }, [selectedSession, onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  const viewSession = async (session) => {
    setSelectedSession(session);
    const cached = msgCache.current[session.id_thread];
    if (cached && cached.messages.length > 0) {
      const slice = cached.messages.slice(session.msgRange[0], session.msgRange[1]);
      setChatContent(slice.length > 0 ? slice : [{ sender: 'info', content: 'No hay contenido disponible.' }]);
      setAssistantName(cached.assistant?.name || 'Asistente');
      setPdfUserName(studentName || cached.user?.name || 'Usuario');
      return;
    }

    try {
      const data = await fetchChatMessagesApi(session.id_thread);
      const sorted = [...(data.messages || [])].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
      msgCache.current[session.id_thread] = { messages: sorted, assistant: data.assistant, user: data.user };
      const slice = sorted.slice(session.msgRange[0], session.msgRange[1]);
      setChatContent(slice.length > 0 ? slice : [{ sender: 'info', content: 'No hay contenido disponible.' }]);
      setAssistantName(data.assistant?.name || 'Asistente');
      setPdfUserName(studentName || data.user?.name || 'Usuario');
    } catch (error) {
      if (error.message === 'auth') return;
      const msg = error.message === 'thread_unavailable'
        ? 'No se pudo cargar este historial. El hilo de conversación ya no está disponible.'
        : 'Error al cargar el contenido del chat.';
      setChatContent([{ sender: 'error', content: msg }]);
    }
  };

  const handleDownload = async (session) => {
    try {
      let messages;
      const cached = msgCache.current[session.id_thread];
      if (cached && cached.messages.length > 0) {
        messages = cached.messages.slice(session.msgRange[0], session.msgRange[1]);
      } else {
        const data = await fetchChatMessagesApi(session.id_thread);
        const sorted = [...(data.messages || [])].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
        messages = sorted.slice(session.msgRange[0], session.msgRange[1]);
      }

      if (!messages || messages.length === 0) {
        messages = [{ sender: 'info', content: 'No hay contenido disponible.' }];
      }

      const currentAssistantName = cached?.assistant?.name || assistantName || 'Asistente';
      const currentPdfUserName = studentName || cached?.user?.name || pdfUserName || 'Usuario';

      const dateObj = session.firstTime ? new Date(session.firstTime * 1000) : new Date(session.fecha_creacion);
      const dateStr = dateObj.toLocaleDateString('es-CL', { timeZone: TZ }).replace(/\//g, '-');
      const fileName = `chat_${currentPdfUserName}_${currentAssistantName}_${dateStr}.pdf`;

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
          header: { fontSize: 15, bold: true },
          subheader: { fontSize: 13, bold: true },
        },
        defaultStyle: { font: 'Roboto' },
      };

      pdfMake.createPdf(docDefinition).download(fileName);
    } catch (error) {
      if (error.message === 'auth') return;
      console.error('Error al descargar PDF:', error);
      alert(error.message === 'thread_unavailable'
        ? 'No se pudo descargar: el hilo ya no está disponible.'
        : 'Error al descargar el PDF.');
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
                      {dateSessions.map((session) => (
                        <tr key={session.id}>
                          <td>{session.firstTime ? new Date(session.firstTime * 1000).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: TZ }) : '—'}</td>
                          <td>{session.lastTime ? new Date(session.lastTime * 1000).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: TZ }) : '—'}</td>
                          <td>{session.msgCount}</td>
                          <td>
                            <FaEye className="icon" onClick={() => viewSession(session)} />
                          </td>
                          <td>
                            <FaFileDownload className="icon" onClick={() => handleDownload(session)} />
                          </td>
                        </tr>
                      ))}
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

      {selectedSession && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedSession(null); }}>
          <div className="modal-container chat-modal">
            <FaTimes className="close-icon" onClick={() => setSelectedSession(null)} />
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
