import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import './HomePage.css';

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No se encontró el token');
          return;
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const nameFromToken = decodedToken.nombre;
        setUserName(nameFromToken);
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
      }
    };

    fetchUserName();
  }, []);

  // Función para redirigir al chat con el último asistente consultado
// Función para redirigir al chat con el último asistente consultado
const continueLastSession = () => {
  navigate('/alumno/chat', {
    state: {
      assistant: null, // Se deja en null para que el componente Chat gestione la carga del último hilo automáticamente
    },
  });
};


  // Función para redirigir al historial de fichas
  const viewHistory = () => {
    navigate('/alumno/historial');
  };

  // Función para iniciar consulta con paciente al azar
  const startRandomConsultation = async () => {
    const assistants = [
      { id: 'asst_Xx06oeSiJnLTHeK2fJHcbxzF', name: 'Matías Ríos', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/rsptuyevsarr3mzqc5ny.png', description: 'Psicólogo clínico con enfoque en ansiedad.' },
      { id: 'asst_rT3d64PKjIP2YCJzQLIKD9zD', name: 'Gloria', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/cenk1mh6mk067bqc7m2t.png', description: 'Especialista en terapias cognitivo-conductuales.' },
      { id: 'asst_gUECq24wTRwPkmitA18WOChZ', name: 'Alejandro López', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/gxl328leuugmfywbkrlt.png', description: 'Terapeuta especializado en adolescentes.' },
      { id: 'asst_B3TfdniT0pSxTOYRtrvC9lvC', name: 'Luis Fernández', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/nkw8ossvdckrwjbnqxtm.png', description: 'Especialista en psicoterapia humanista.' },
      { id: 'asst_NyQk1ZDUK5fkoQAUEKjsodTZ', name: 'Carlos Mendoza', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564022/spr6gt9besefwyd57wvk.png', description: 'Especialista en terapias cognitivo-conductuales.' },
      { id: 'asst_CVlAdD3yeSlGl3mBlDdTFIh8', name: 'José Ramírez', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/a4jlurybskdwftw59poa.png', description: 'Terapeuta especializado en adolescentes.' },
      { id: 'asst_kyQLTBmPTvbIQTiSQlNtwNoH', name: 'Maria Gomez', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/su5qnrj0hgpoyuy4j3to.png', description: 'Especialista en psicoterapia humanista.' },
    ];

    const randomAssistant = assistants[Math.floor(Math.random() * assistants.length)];

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/crear-hilo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ patientId: randomAssistant.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear un nuevo hilo');
      }

      navigate('/alumno/chat', {
        state: {
          assistant: {
            id: randomAssistant.id,
            name: randomAssistant.name,
            image: randomAssistant.image,
            description: randomAssistant.description,
            threadId: data.threadId,
          },
        },
      });
    } catch (error) {
      console.error('Error al iniciar una nueva consulta:', error);
      alert('No se pudo iniciar una nueva consulta. Intente nuevamente.');
    }
  };

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Navbar isSidebarOpen={isSidebarOpen} />
        <div className="content">
          <h1 className="welcome-message">Bienvenido/a <span className="user-name">{userName}</span></h1>
          <p className="description">
            Explicación del programa ejemplo "Hola aquí, tendrás la oportunidad de interactuar con una inteligencia artificial avanzada diseñada para simular sesiones de terapia y explorar diversas facetas de la psicología".
          </p>
          <h2 className="action-prompt">¿Qué quieres hacer hoy?</h2>
          <div className="cards-container">
            <div className="card" onClick={continueLastSession}>
              <h3>Continuar sesión con último paciente consultado</h3>
              <p>
                Interactúa con perfiles de pacientes cuidadosamente diseñados que presentan una variedad de temas y trastornos.
              </p>
            </div>
            <div className="card" onClick={startRandomConsultation}>
              <h3>Iniciar nueva consulta con paciente al azar</h3>
              <p>
                Mejora tus habilidades terapéuticas mediante sesiones simuladas con nuestra IA, ajustada para reflejar diferentes enfoques y estilos de terapia.
              </p>
            </div>
            <div className="card" onClick={viewHistory}>
              <h3>Revisar tus fichas de Pacientes</h3>
              <p>
                Revisa tus fichas de pacientes y mantén un registro ordenado de tus interacciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
