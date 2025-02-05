// src/pages/Docentes/SeccionesGeneral/SeccionesGeneral.js
import React, { useState, useEffect } from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import './SeccionesGeneral.css';

const API_URL = process.env.REACT_APP_API_URL;

const SeccionesGeneral = () => {
  const [secciones, setSecciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token'); // Recuperar token

    fetch(`${API_URL}/api/admin/secciones`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 🔹 Agregar el token aquí
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error en la autenticación');
        return res.json();
      })
      .then((data) => setSecciones(data))
      .catch((error) => console.error('Error al obtener secciones:', error));
  }, []);

  const cambiarEstado = async (id, estadoActual) => {
    try {
      const token = localStorage.getItem('token'); // Recuperar token
      const response = await fetch(`${API_URL}/api/admin/secciones/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🔹 Agregar el token aquí
        },
        body: JSON.stringify({ enabled: !estadoActual })
      });
      if (response.ok) {
        setSecciones((prevSecciones) =>
          prevSecciones.map((sec) =>
            sec.id_seccion === id ? { ...sec, enabled: !estadoActual } : sec
          )
        );
      }
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
    }
  };

  // Paginar resultados
  const totalPages = Math.ceil(secciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = secciones.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="secciones-general-container">
      <GeneralNavbar />
      <div className="content">
        <div className="actions">
          <button className="add-section">➕ Agregar secciones</button>
          <button className="delete-section">➖ Eliminar secciones</button>
        </div>
        <table className="sections-table">
          <thead>
            <tr>
              <th>Secciones</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((sec) => (
              <tr key={sec.id_seccion}>
                <td>{sec.nombre}</td>
                <td>
                  <label className="switch">
                    <input type="checkbox" checked={sec.enabled} onChange={() => cambiarEstado(sec.id_seccion, sec.enabled)} />
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

export default SeccionesGeneral;
