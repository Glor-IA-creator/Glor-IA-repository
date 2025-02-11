import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import './EstadisticasDocentes.css';

const API_URL = process.env.REACT_APP_API_URL;

// Lista de asistentes con su ID y nombre
const ASSISTANTS = [
  { id: "asst_NyQk1ZDUK5fkoQAUEKjsodTZ", name: "Carlos Mendoza" },
  { id: "asst_CVlAdD3yeSlGl3mBlDdTFIh8", name: "José Ramírez" },
  { id: "asst_kyQLTBmPTvbIQTiSQlNtwNoH", name: "Maria Gomez" },
  { id: "asst_Xx06oeSiJnLTHeK2fJHcbxzF", name: "Matías Ríos" },
  { id: "asst_gUECq24wTRwPkmitA18WOChZ", name: "Alejandro López" },
  { id: "asst_B3TfdniT0pSxTOYRtrvC9lvC", name: "Luis Fernández" },
  { id: "asst_rT3d64PKjIP2YCJzQLIKD9zD", name: "GLORIA" }
];

const EstadisticasDocentes = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/estudiantes/listado`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          // Procesar cada estudiante y agregar información de chats
          const processedStudents = await Promise.all(data.map(async (student) => {
            const chatResponse = await fetch(`${API_URL}/api/estudiantes/${student.id_usuario}/chats`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            const chatData = await chatResponse.json();
            const threads = Array.isArray(chatData) ? chatData : [];

            // Obtener nombres de asistentes únicos
            const uniqueAssistants = [...new Set(threads.map(t => t.id_asistente))];
            const iaConsultadas = uniqueAssistants
              .map(id => ASSISTANTS.find(a => a.id === id)?.name)
              .filter(name => name); // Filtrar nombres válidos

            return {
              ...student,
              fichas: threads.length, // Número total de hilos
              iaConsultadas, // Nombres de IA consultadas
              minutosUso: student.minutos_uso || 0, // ✅ Mostrar minutos de uso correctamente
            };
          }));

          setStudents(processedStudents);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error al obtener estadísticas de docentes:', error);
        setStudents([]);
      }
    };

    fetchStudents();
  }, []);

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const paginatedData = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="estadisticas-docentes-container">
      <AdminNavbar />
      <div className="content">
        <table className="statistics-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Ingresos</th>
              <th>Minutos de Uso</th> {/* ✅ Mostrar minutos en vez de horas */}
              <th>Pacientes</th>
              <th>Fichas</th>
              <th>IA Consultadas</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((student) => (
                <tr key={student.id_usuario}>
                  <td>{student.nombre}</td>
                  <td>{student.sesiones}</td>
                  <td>{student.minutosUso}</td> {/* ✅ Se muestra correctamente los minutos */}
                  <td>{student.pacientes}</td>
                  <td>{student.fichas}</td> {/* ✅ Número de fichas (hilos) */}
                  <td className="ia-consultadas">
                    {student.iaConsultadas && student.iaConsultadas.length > 0 ? (
                      student.iaConsultadas.map((ia, i) => (
                        <div key={i} className="ia-name">{ia}</div>
                      ))
                    ) : (
                      <span>Sin consultas</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No hay datos disponibles</td>
              </tr>
            )}
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
    </div>
  );
};

export default EstadisticasDocentes;
