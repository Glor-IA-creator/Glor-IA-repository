import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import { FaCommentDots } from 'react-icons/fa';
import ChatHistoryModal from './ChatHistoryModal'; // Importa el nuevo modal
import './AlumnosDocentes.css';

const API_URL = process.env.REACT_APP_API_URL;

const AlumnosDocentes = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 15;

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/estudiantes/listado`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);

        const years = [...new Set(data.flatMap(student => student.secciones.map(sec => sec.año)))];
        const sections = [...new Set(data.flatMap(student => student.secciones.map(sec => sec.nombre)))];

        setAvailableYears(years);
        setAvailableSections(sections);
      })
      .catch((error) => console.error('Error al obtener estudiantes:', error));
  }, []);

  const fetchChatHistory = (student) => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/estudiantes/${student.id_usuario}/chats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setChatHistory(data || []);
        setSelectedStudent(student);
        setShowModal(true);
      })
      .catch((error) => console.error('Error al obtener chats:', error));
  };

  const filteredStudents = students.filter(student => {
    const matchesYear = selectedYear ? student.secciones.some(sec => sec.año.toString() === selectedYear) : true;
    const matchesSection = selectedSection ? student.secciones.some(sec => sec.nombre === selectedSection) : true;
    return matchesYear && matchesSection;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="alumnos-docentes-container">
      <AdminNavbar />
      <div className="content">
        <div className="filters">
          <div className="filter-item">
            <label>Seleccionar Año Académico</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">Todos</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Filtrar por Sección</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              <option value="">Todas</option>
              {availableSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="students-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Sesiones</th>
              <th>Pacientes</th>
              <th>Secciones</th>
              <th>Historial</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((student) => (
              <tr key={student.id_usuario}>
                <td>{student.nombre}</td>
                <td>{student.email}</td>
                <td>{student.sesiones}</td>
                <td>{student.pacientes}</td>
                <td>
                  {student.secciones.length > 0
                    ? student.secciones.map(sec => `${sec.nombre} (${sec.año}-${sec.semestre})`).join(', ')
                    : 'Sin Sección'}
                </td>
                <td>
                  <FaCommentDots className="chat-icon" onClick={() => fetchChatHistory(student)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </button>
          <span className="pagination-info">Página {currentPage} de {totalPages || 1}</span>
          <button
            className="pagination-button"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>

      {showModal && (
        <ChatHistoryModal 
          chats={chatHistory} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default AlumnosDocentes;
