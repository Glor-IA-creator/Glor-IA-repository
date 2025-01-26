// src/pages/Docentes/AlumnosDocentes/AlumnosDocentes.js
import React from 'react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import StudentsTable from '../../../components/StudentTable/StudentTable';
import './AlumnosDocentes.css';

const AlumnosDocentes = () => {
  return (
    <div className="alumnos-docentes-container">
      <AdminNavbar />
      <div className="content">
        <div className="filters">
          <div className="filter-item">
            <label>Seleccionar</label>
            <select>
              <option>Año académico</option>
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Filtrar por</label>
            <select>
              <option>Sección</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>
        </div>
        
        {/* Aquí usamos el nuevo componente StudentsTable */}
        <StudentsTable />

        <div className="pagination">
          <button className="pagination-button">Anterior</button>
          <span className="pagination-info">Página 1 de 10</span>
          <button className="pagination-button">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default AlumnosDocentes;
