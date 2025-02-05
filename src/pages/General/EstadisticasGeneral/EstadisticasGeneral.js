// src/pages/Docentes/EstadisticasDocentes/EstadisticasDocentes.js
import React from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import './EstadisticasGeneral.css';

const EstadisticasGeneral = () => {
  return (
    <div className="estadisticas-docentes-container">
      <GeneralNavbar />
      <div className="content">
        <table className="statistics-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Ingresos</th>
              <th>Horas</th>
              <th>Pacientes</th>
              <th>Fichas</th>
              <th>IA Consultadas</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index}>
                <td>Rene Díaz</td>
                <td>9</td>
                <td>0024</td>
                <td>5</td>
                <td>34</td>
                <td className="ia-consultadas">
                  {['Carmen', 'David', 'Gregorio', 'Manuel', 'Cristina', 'Renata'].map((name, i) => (
                    <div key={i} className="ia-name">
                      {name}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button className="pagination-button">Anterior</button>
          <span className="pagination-info">Página 1 de 10</span>
          <button className="pagination-button">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasGeneral;
