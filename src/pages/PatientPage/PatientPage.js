import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import PatientCard from '../../components/PatientCard/PatientCard';
import './PatientsPage.css';

const patients = [
  {
    id: "asst_Xx06oeSiJnLTHeK2fJHcbxzF",
    name: 'Matías Ríos',
    age: 25,
    location: 'Concepción - Chile' ,
    image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/rsptuyevsarr3mzqc5ny.png',
  },
  {
    id: "asst_rT3d64PKjIP2YCJzQLIKD9zD",
    name: 'Gloria',
    age: '42',
    location: 'Sevilla - España',
    image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/cenk1mh6mk067bqc7m2t.png',
  },
  {
    id: "asst_gUECq24wTRwPkmitA18WOChZ",
    name: 'Alejandro López',
    age: 21,
    location: 'Santiago - Chile',
    image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/gxl328leuugmfywbkrlt.png',
  },
  {
    id: "asst_B3TfdniT0pSxTOYRtrvC9lvC",
    name: 'Luis Fernández',
    age: 29,
    location: 'Santiago - Chile',
    image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/nkw8ossvdckrwjbnqxtm.png',
  },
  {
    id: "asst_kyQLTBmPTvbIQTiSQlNtwNoH",
    name: 'Maria Gomez',
    age: 34,
    location: 'Santiago - Chile',
    image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/su5qnrj0hgpoyuy4j3to.png',
  },
  {
    id: "asst_CVlAdD3yeSlGl3mBlDdTFIh8",
    name: 'José Ramírez',
    age: 72,
    location: 'Temuco - Chile',
    image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/a4jlurybskdwftw59poa.png',
  },
  {
    id: "asst_NyQk1ZDUK5fkoQAUEKjsodTZ",
    name: 'Carlos Mendoza',
    age: 58,
    location: 'Santiago - Chile',
    image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564022/spr6gt9besefwyd57wvk.png',
  }
];

const PatientsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Estados para manejar el modal de confirmación
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [patientToConfirm, setPatientToConfirm] = useState(null);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  // 1. Al hacer clic en "Iniciar conversación", primero abrimos el modal
  const handleClickStartConversation = (patient) => {
    setPatientToConfirm(patient);
    setShowConfirmationModal(true);
  };

  // 2. Si el usuario confirma "Sí", creamos el hilo
  const handleConfirmStartConversation = async () => {
    if (!patientToConfirm) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log("Enviando solicitud al backend con patientId:", patientToConfirm.id);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/chat/crear-hilo`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ patientId: patientToConfirm.id }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Hilo creado:", data);

      navigate('/alumno/chat', {
        state: {
          assistant: {
            id: patientToConfirm.id,
            name: patientToConfirm.name,
            image: patientToConfirm.image,
            threadId: data.threadId,
          },
        },
      });
    } catch (err) {
      console.error("Error al crear el hilo:", err.message);
      setError(err.message || "Error desconocido.");
    } finally {
      setLoading(false);
      setShowConfirmationModal(false);
      setPatientToConfirm(null);
    }
  };

  // 3. Si el usuario cancela "No", cerramos el modal y limpiamos
  const handleCancelStartConversation = () => {
    setShowConfirmationModal(false);
    setPatientToConfirm(null);
  };

  // Nuevo: Función para retomar la conversación
  const handleContinueConversation = async (patient) => {
    try {
      const token = localStorage.getItem('token');
      console.log("Retomando conversación para:", patient.id);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/hilos/ultimo-hilo-asistente?assistantId=${patient.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Último hilo obtenido:", data);
      navigate('/alumno/chat', {
        state: {
          assistant: {
            id: patient.id,
            name: patient.name,
            image: patient.image,
          },
          threadId: data.threadId,
        },
      });
    } catch (err) {
      console.error("Error al retomar la conversación:", err.message);
      alert(err.message || "Error desconocido.");
    }
  };

  return (
    <div className={`patients-page-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Navbar />
        <div className="patients-container">
          <div className="patients-grid">
            {patients.map((patient, index) => (
              <PatientCard
                key={index}
                id={patient.id}
                name={patient.name}
                age={patient.age}
                location={patient.location}
                image={patient.image}
                // En vez de llamar directo a handleStartConversation, llamamos a la función que muestra el modal
                onStartConversation={() => handleClickStartConversation(patient)}
                onContinueConversation={() => handleContinueConversation(patient)}
                onViewImage={() => setSelectedImage(patient.image)}
              />
            ))}
          </div>
        </div>
        {loading && <p>Creando hilo...</p>}
        {error && <p className="error">{error}</p>}

        {/* Modal para ver la imagen en grande */}
        {selectedImage && (
          <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage} alt="Paciente" className="modal-image" />
              <button className="close-button" onClick={() => setSelectedImage(null)}>✖</button>
            </div>
          </div>
        )}

        {/* Modal de confirmación para iniciar conversación */}
            {showConfirmationModal && (
      <div className="modal-overlay-confirmation" onClick={handleCancelStartConversation}>
        <div className="modal-content-confirmation" onClick={(e) => e.stopPropagation()}>
          <h3>RECUERDA</h3>
          <p>Al iniciar una nueva conversación, el/la paciente simulará no tener historia contigo. ¿Estás de acuerdo?</p>
          <div className="buttons-container-confirmation">
            <button onClick={handleConfirmStartConversation}>Sí</button>
            <button onClick={handleCancelStartConversation}>No</button>
          </div>
        </div>
      </div>
    )}

      </div>
    </div>
  );
};

export default PatientsPage;
