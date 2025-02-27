import React, { useState, useEffect } from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import { FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Librería para exportar a Excel
import './EstadisticasGeneral.css';

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

const EstadisticasGeneral = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState('all'); // Filtro por tipo de usuario
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsersWithRoles = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/api/admin/estudiantes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          const processedUsers = await Promise.all(data.map(async (user) => {
            const chatResponse = await fetch(`${API_URL}/api/estudiantes/${user.id_usuario}/chats`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            if (!chatResponse.ok) {
              return { ...user, fichas: 0, iaConsultadas: [], minutosUso: user.minutos_uso || 0 };
            }

            const chatData = await chatResponse.json();
            const threads = Array.isArray(chatData) ? chatData : [];

            const iaConsultadas = [...new Set(
              threads.map(thread => ASSISTANTS.find(a => a.id === thread.id_asistente)?.name || "Desconocido")
            )];

            return {
              ...user,
              fichas: threads.length,
              iaConsultadas,
              minutosUso: user.minutos_uso || 0, // ✅ Aseguramos que minutos de uso se obtienen
            };
          }));

          setUsers(processedUsers);
          setFilteredUsers(processedUsers);
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        setUsers([]);
        setFilteredUsers([]);
      }
    };

    fetchUsersWithRoles();
  }, []);

  useEffect(() => {
    let filtered = users.filter(user => 
      selectedRole === 'all' ||
      (selectedRole === 'estudiante' && user.id_rol === 3) ||
      (selectedRole === 'docente' && user.id_rol === 2)
    );

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [selectedRole, users]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      Nombre: user.nombre,
      Correo: user.email,
      Perfil: user.id_rol === 3 ? "Estudiante" : "Docente",
      "Minutos de Uso": user.minutosUso || 0, // ✅ Exportación correcta de minutos de uso
      Pacientes: user.pacientes || 0,
      Fichas: user.fichas || 0,
      'IA Consultadas': user.iaConsultadas.join(', ')
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "Usuarios_General.xlsx");
  };

  return (
    <div className="estadisticas-docentes-container">
      <GeneralNavbar />
      <div className="content">
        <div className="filters">
          <div className="filter-buttons">
            <button className={`filter-button ${selectedRole === 'docente' ? 'active' : ''}`} onClick={() => setSelectedRole('docente')}>
              Docentes
            </button>
            <button className={`filter-button ${selectedRole === 'estudiante' ? 'active' : ''}`} onClick={() => setSelectedRole('estudiante')}>
              Estudiantes
            </button>
            <button className={`filter-button ${selectedRole === 'all' ? 'active' : ''}`} onClick={() => setSelectedRole('all')}>
              Todos
            </button>
          </div>

          <div className="download-container">
            <button className="download-button" onClick={exportToExcel}>
              <FaDownload /> Descargar histórico
            </button>
          </div>
        </div>

        <table className="statistics-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Perfil</th>
              <th>Minutos de Uso</th> {/* ✅ Minutos Check */}
              <th>Pacientes</th>
              <th>Ingresos</th>
              <th>IA Consultadas</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((user) => (
                <tr key={user.id_usuario}>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>{user.id_rol === 3 ? "Estudiante" : "Docente"}</td>
                  <td>{user.minutosUso || 0} min</td> {/* ✅ Se muestran los minutos de uso */}
                  <td>{user.pacientes || 0}</td>
                  <td>{user.fichas || 0}</td>
                  <td className="ia-consultadas">
                    {user.iaConsultadas && user.iaConsultadas.length > 0 ? (
                      user.iaConsultadas.map((ia, i) => (
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
                <td colSpan="7" className="no-data">No hay datos disponibles</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button className="pagination-button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Anterior
          </button>
          <span className="pagination-info">Página {currentPage} de {totalPages || 1}</span>
          <button className="pagination-button" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasGeneral;
