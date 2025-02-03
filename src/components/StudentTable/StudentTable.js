import React, { useEffect, useState } from 'react';
import { FaFileAlt, FaFileMedical } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Modal from '../HistoryTable/Modal';
import './StudentTable.css';

const StudentsTable = ({ selectedYear, selectedSection }) => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const token = localStorage.getItem('token');

        // Generar URL con filtros
        let url = `${process.env.REACT_APP_API_URL}/api/estudiantes/listado`;

        const queryParams = new URLSearchParams();
        if (selectedYear) queryParams.append("year", selectedYear);
        if (selectedSection) queryParams.append("section", selectedSection); // Sección ahora se envía correctamente
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Error al cargar los estudiantes');

        const data = await response.json();
        
        setStudents(data);
      } catch (err) {
        console.error('Error en fetch:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [selectedYear, selectedSection]); // Se ejecuta cuando cambian los filtros

  // Función para abrir el modal con los datos del estudiante seleccionado
  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setModalData(student.fichasClinicas || []); // Asegura que `fichasClinicas` sea un array válido
    setModalVisible(true);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="students-table-container">
      <table className="students-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Correo</th>
            <th>N° sesiones</th>
            <th>N° Pacientes</th>
            <th>Ver</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{student.nombre}</td>
              <td>{student.email}</td>
              <td>{student.sesiones}</td>
              <td>{student.pacientes}</td>
              <td>
                <FaFileAlt className="icon" onClick={() => handleOpenModal(student)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalVisible && selectedStudent && (
        <Modal onClose={() => setModalVisible(false)}>
          <h3>historial de sesiones {selectedStudent.nombre}</h3>
          <ul className="modal-list">
            {modalData.map((ficha, index) => (
              <li key={index} className="modal-list-item">
                {ficha.date}{' '}
                <FaFileMedical
                  className="file-icon-small"
                  onClick={() =>
                    navigate('/alumno/chat', {
                      state: {
                        student: {
                          id: selectedStudent.id,
                          name: selectedStudent.nombre,
                        },
                        threadId: ficha.id,
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

export default StudentsTable;
