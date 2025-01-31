import React, { useEffect, useState } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import './StudentTable.css';

const StudentsTable = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Depuración: verifica el token

        const url = `${process.env.REACT_APP_API_URL}/api/estudiantes/listado`;
        console.log('URL:', url); // Depuración: verifica la URL

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Response status:', response.status); // Depuración: verifica el estado de la respuesta
        const responseText = await response.text();
        console.log('Response text:', responseText); // Depuración: verifica el texto de la respuesta

        if (!response.ok) {
          throw new Error('Error al cargar el listado de alumnos');
        }

        const data = JSON.parse(responseText);
        setStudents(data);
      } catch (err) {
        console.error('Error al cargar la lista:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

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