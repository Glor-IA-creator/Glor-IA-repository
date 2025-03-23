import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Chat.css';
import { FiSend } from 'react-icons/fi';
import ChatPatientDetails from './ChatPatientDetails';
import TextareaAutosize from 'react-textarea-autosize';


const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const assistantFromState = location.state?.assistant;
  const threadIdFromState = location.state?.threadId;

  const [assistant, setAssistant] = useState(assistantFromState || null);
  const [threadId, setThreadId] = useState(threadIdFromState || null);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isResponding, setIsResponding] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [loading, setLoading] = useState(!threadIdFromState);
  const messagesEndRef = useRef(null);
  const patientDetailsRef = useRef(null);

  const fetchMessages = useCallback(async (threadId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/chat/obtener-mensajes?threadId=${threadId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error('Error al cargar los mensajes del hilo.');
      }
  
      const data = await response.json();
  
      // Primero invertimos el orden para que el primer elemento del array
      // sea realmente el primer mensaje de la conversación.
      let messagesArray = data.messages.reverse();
  
      // Luego, asignamos "verde" a los índices pares (0, 2, 4...) y "azul" a los impares (1, 3, 5...).
      messagesArray = messagesArray.map((msg, index) => {
        // index 0 => verde, index 1 => azul, index 2 => verde, etc.
        const isEven = index % 2 === 0;
        return {
          // Puedes modificar 'sender' si deseas un nombre distinto
          sender: isEven ? 'Tú' : 'PACIENTE',
          text: msg.content,
          // type será 'user' para verde y 'assistant' para azul
          // (asumiendo que tu componente CSS mapea 'user' a verde y 'assistant' a azul).
          type: isEven ? 'user' : 'assistant',
        };
      });
  
      setMessages(messagesArray);
    } catch (error) {
      console.error('Error al obtener los mensajes del hilo:', error.message);
      alert('No se pudieron cargar los mensajes del hilo.');
    } finally {
      setLoading(false);
    }
  }, []);
  

  /* ────────────────────────────────────────────── */
  /* AGREGADOS PARA CARGAR EL ÚLTIMO HILO DEL ASISTENTE */
  /* ────────────────────────────────────────────── */
  // Función para obtener el último hilo del asistente
  const fetchLastThreadForAssistant = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/hilos/ultimo-hilo-asistente?assistantId=${assistantFromState?.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar el último hilo del asistente.');
      }

      const data = await response.json();
      setAssistant({
        id: data.patientId,
        name: data.name,
        image: data.image,
        description: data.description,
      });
      setThreadId(data.threadId);
      fetchMessages(data.threadId);
    } catch (error) {
      console.error('Error al obtener el último hilo del asistente:', error.message);
      alert('No se pudo cargar el último hilo del asistente.');
      navigate('/');
    }
  };

  // Nuevo useEffect para cargar el último hilo del asistente si el usuario llegó con uno
  useEffect(() => {
    if (!threadId && assistantFromState) {
      fetchLastThreadForAssistant();
    }
  }, [threadId, assistantFromState]);
  /* ────────────────────────────────────────────── */
  /* FIN DE LOS AGREGADOS */
  /* ────────────────────────────────────────────── */

  // Fetch the last thread if no threadId is provided (ya existente)
  useEffect(() => {
    const fetchLastThread = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/ultimo-hilo`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar el último hilo.');
        }

        const data = await response.json();

        setAssistant({
          id: data.patientId,
          name: data.name,
          image: data.image,
          description: data.description,
        });
        setThreadId(data.threadId);
        await fetchMessages(data.threadId);
      } catch (error) {
        console.error('Error al obtener el último hilo:', error.message);
        alert('No se pudo cargar el último hilo.');
        navigate('/'); // Redirigir si no se puede cargar
      }
    };

    if (!threadId) {
      fetchLastThread();
    } else {
      fetchMessages(threadId);
    }
  }, [threadId, fetchMessages, navigate]);

  const handleSubmit = async () => {
    if (!userMessage.trim() || isResponding) return;

    setMessages((prev) => [...prev, { sender: 'Tú', text: userMessage, type: 'user' }]);
    setUserMessage('');
    setIsResponding(true);

    try {
      const token = localStorage.getItem('token');

      setMessages((prev) => [...prev, { sender: assistant?.name || 'Asistente', text: 'Escribiendo...', type: 'assistant-loading' }]);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/agregar-mensaje`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mensaje: userMessage,
          threadId,
          assistantId: assistant?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === 'assistant-loading'
            ? { sender: assistant?.name || 'Asistente', text: data.messages[0] || 'Sin respuesta', type: 'assistant' }
            : msg
        )
      );
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setMessages((prev) => [
        ...prev,
        { sender: assistant?.name || 'Asistente', text: 'Hubo un error al procesar tu mensaje.', type: 'assistant' },
      ]);
    } finally {
      setIsResponding(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClickOutside = (event) => {
    if (
      patientDetailsRef.current &&
      !patientDetailsRef.current.contains(event.target)
    ) {
      setShowPatientDetails(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return <p>Cargando datos del asistente...</p>;
  }

  if (!assistant || !threadId) {
    return <p>Error: No se encontró información del asistente o el hilo.</p>;
  }

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <div className="assistant-info">
          <div className="assistant-details">
            <img
              src={assistant.image || 'https://via.placeholder.com/80'}
              alt={assistant.name || 'Asistente'}
              className="assistant-avatar"
            />
            <span>{assistant.name || 'Desconocido'}</span>
          </div>
{/*           <button
            className="view-profile-button"
            onClick={() => setShowPatientDetails(!showPatientDetails)}
          >
            Ficha Paciente
          </button> */}
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <p className={`message-text ${msg.type === 'user' ? 'user-text' : 'assistant-text'}`}>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
      <TextareaAutosize
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Escribe aquí..."
        disabled={isResponding}
        minRows={1} // Filas mínimas
      />
      <button type="button" onClick={handleSubmit} disabled={isResponding}>
        <FiSend />
      </button>
    </div>

      <div
        className={`chat-patient-details ${showPatientDetails ? 'visible' : ''}`}
        ref={patientDetailsRef}
      >
        <ChatPatientDetails isVisible={showPatientDetails} assistant={assistant} />
      </div>
    </div>
  );
};

export default Chat;
