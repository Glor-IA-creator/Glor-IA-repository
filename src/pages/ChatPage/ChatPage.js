import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import Chat from '../../components/Chat/Chat';
import './ChatPage.css';

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const sessionStartTime = useRef(Date.now());
  const intervalRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  // 🔹 Función para registrar tiempo de uso cada 60 segundos
  const registrarTiempoDeUso = async () => {
    const minutos = 1;
    console.log(`⏳ Enviando tiempo de uso: ${minutos} minuto`);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/registrar-tiempo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ minutos }),
      });

      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);
    } catch (error) {
      console.error('❌ Error al registrar tiempo de uso:', error);
    }
  };

  // 🔹 Iniciar el contador cuando la página carga
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!document.hidden) {
        registrarTiempoDeUso();
      }
    }, 60000); // Ejecuta cada 60 segundos

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  // 🔹 Registrar tiempo de uso antes de salir
  const handleBeforeUnload = () => {
    registrarTiempoDeUso();
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="chat-page-container">
      <div className={`sidebar-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <div className="main-content">
        <Navbar />
        <div className="chat-container">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
