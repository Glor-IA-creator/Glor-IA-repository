import React, { useState, useEffect } from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import './SeccionesGeneral.css';

const API_URL = process.env.REACT_APP_API_URL;

const SeccionesGeneral = () => {
  const [secciones, setSecciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionYear, setNewSectionYear] = useState('');
  const [newSectionSemester, setNewSectionSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/secciones`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setSecciones(data))
      .catch((error) => console.error('Error al obtener secciones:', error));
  }, []);

  const cambiarEstado = async (id, estadoActual) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/secciones/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  const agregarSeccion = async () => {
    if (!newSectionName || !newSectionYear || !newSectionSemester) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    const parsedYear = parseInt(newSectionYear, 10);
    const parsedSemester = parseInt(newSectionSemester, 10);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      alert("⚠️ Ingresa un año válido (entre 2000 y 2100).");
      return;
    }

    if (![1, 2].includes(parsedSemester)) {
      alert("⚠️ El semestre debe ser 1 o 2.");
      return;
    }

    if (!window.confirm(`¿Seguro que deseas agregar la sección "${newSectionName}" del año ${parsedYear}, semestre ${parsedSemester}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/secciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: newSectionName,
          año: parsedYear,
          semestre: parsedSemester
        })
      });

      if (response.ok) {
        const nuevaSeccion = await response.json();
        setSecciones([...secciones, nuevaSeccion]);
        setShowAddModal(false);
        setNewSectionName('');
        setNewSectionYear('');
        setNewSectionSemester('');
        alert("✅ Sección agregada con éxito.");
      }
    } catch (error) {
      console.error('Error al agregar sección:', error);
      alert('❌ Error al agregar la sección.');
    }
  };

  const eliminarSeccion = async () => {
    if (!selectedSection) {
      alert("⚠️ Debes seleccionar una sección.");
      return;
    }

    if (!window.confirm("❌ ¿Seguro que deseas eliminar esta sección? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/secciones/${selectedSection}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSecciones(secciones.filter(sec => sec.id_seccion !== parseInt(selectedSection, 10)));
        setShowDeleteModal(false);
        alert("✅ Sección eliminada correctamente.");
      }
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      alert("❌ Error al eliminar la sección.");
    }
  };

  const totalPages = Math.ceil(secciones.length / itemsPerPage);
  const paginatedData = secciones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="secciones-general-container">
      <GeneralNavbar />
      <div className="content">
        <div className="actions">
          <button className="action-button add-section" onClick={() => setShowAddModal(true)}>➕ Agregar sección</button>
          <button className="action-button delete-section" onClick={() => setShowDeleteModal(true)}>➖ Eliminar sección</button>
        </div>

        <table className="sections-table">
          <thead>
            <tr>
              <th>Sección</th>
              <th>Año</th>
              <th>Semestre</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((sec) => (
              <tr key={sec.id_seccion}>
                <td>{sec.nombre}</td>
                <td>{sec.año}</td>
                <td>{sec.semestre}</td>
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
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Agregar Sección</h3>
            <input type="text" placeholder="Nombre de la sección" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} />
            <input type="number" placeholder="Año" value={newSectionYear} onChange={(e) => setNewSectionYear(e.target.value)} />
            <input type="number" placeholder="Semestre (1 o 2)" value={newSectionSemester} onChange={(e) => setNewSectionSemester(e.target.value)} />
            <div className="modal-actions">
              <button className="modal-button confirm" onClick={agregarSeccion}>Agregar</button>
              <button className="modal-button cancel" onClick={() => setShowAddModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Eliminar Sección</h3>
            <select className="select-dropdown" onChange={(e) => setSelectedSection(e.target.value)}>
              <option value="">Selecciona una sección</option>
              {secciones.map((sec) => (
                <option key={sec.id_seccion} value={sec.id_seccion}>{sec.nombre}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="modal-button confirm" onClick={eliminarSeccion}>Eliminar</button>
              <button className="modal-button cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeccionesGeneral;
