import React, { useState } from 'react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import StudentsTable from '../../../components/StudentTable/StudentTable';
import './AlumnosDocentes.css';

const AlumnosDocentes = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  return (
    <div className="alumnos-docentes-container">
      <AdminNavbar />
      <div className="content">
        <div className="filters">
          <div className="filter-item">
            <label>Seleccionar</label>
            <select onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">Año académico</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Filtrar por</label>
            <select onChange={(e) => setSelectedSection(e.target.value)}>
              <option value="">Sección</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>



        {/* Pasar los filtros a la tabla */}
        <StudentsTable selectedYear={selectedYear} selectedSection={selectedSection} />

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
