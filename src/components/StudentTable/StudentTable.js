// src/components/StudentsTable/StudentsTable.js
import React from 'react';
import { FaFileAlt } from 'react-icons/fa';
import './StudentTable.css';

const StudentsTable = () => {
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
          {Array.from({ length: 20 }).map((_, index) => (
            <tr key={index}>
              <td>Rosa Altamirano</td>
              <td>rosa@gmail.com</td>
              <td>320</td>
              <td>5</td>
              <td>
                <FaFileAlt className="icon" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTable;
