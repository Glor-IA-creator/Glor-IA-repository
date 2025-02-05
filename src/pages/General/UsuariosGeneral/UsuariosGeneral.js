// src/pages/Docentes/EstadisticasDocentes/EstadisticasDocentes.js
import React, { useState, useEffect } from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import './UsuariosGeneral.css';

const API_URL = process.env.REACT_APP_API_URL;

const UsuariosGeneral = () => {
  const [selectedProfile, setSelectedProfile] = useState('3'); // 3: Estudiantes, 2: Docentes
  const [estudiantes, setEstudiantes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetch(`${API_URL}/api/admin/estudiantes`)
      .then((res) => res.json())
      .then((data) => setEstudiantes(data))
      .catch((error) => console.error('Error al obtener estudiantes:', error));
  }, []);

  const cambiarEstado = async (id, estadoActual) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/estudiantes/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !estadoActual })
      });
      if (response.ok) {
        setEstudiantes((prevEstudiantes) =>
          prevEstudiantes.map((est) =>
            est.id_usuario === id ? { ...est, enabled: !estadoActual } : est
          )
        );
      }
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
    }
  };

  // Filtrar por perfil seleccionado
  const estudiantesFiltrados = estudiantes.filter(est => est.id_rol.toString() === selectedProfile);

  // Paginar resultados
  const totalPages = Math.ceil(estudiantesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = estudiantesFiltrados.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="estadisticas-docentes-container">
      <GeneralNavbar />
      <div className="content">
        <div className="profile-selector">
          <label htmlFor="profile">Seleccionar Perfil</label>
          <select
            id="profile"
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
          >
            <option value="3">Estudiantes</option>
            <option value="2">Docentes</option>
          </select>
        </div>
        <table className="statistics-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Correo</th>
              <th>Sección</th>
              <th>Sesiones</th>
              <th>Pacientes</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((est) => (
              <tr key={est.id_usuario}>
                <td>{est.nombre}</td>
                <td>{est.email}</td>
                <td>
                  {est.secciones && est.secciones.length > 0
                    ? est.secciones.map((s) => `${s.nombre} (${s.año}-${s.semestre})`).join(', ')
                    : 'Sin Sección'}
                </td>
                <td>{est.sesiones}</td>
                <td>{est.pacientes}</td>
                <td>
                  <label className="switch">
                    <input type="checkbox" checked={est.enabled} onChange={() => cambiarEstado(est.id_usuario, est.enabled)} />
                    <span className="slider round"></span>
                  </label>
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
          <span className="pagination-info">Página {currentPage} de {totalPages}</span>
          <button 
            className="pagination-button" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsuariosGeneral;
