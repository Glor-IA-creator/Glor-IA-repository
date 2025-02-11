import React, { useState, useEffect } from 'react';
import GeneralNavbar from '../../../components/GeneralNavbar/GeneralNavbar';
import './UsuariosGeneral.css';

const API_URL = process.env.REACT_APP_API_URL;

const UsuariosGeneral = () => {
  const [selectedProfile, setSelectedProfile] = useState('3'); // 3: Estudiantes, 2: Docentes
  const [estudiantes, setEstudiantes] = useState([]);
  const [secciones, setSecciones] = useState([]); // ✅ Agregar secciones
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Estados para el modal de agregar usuario
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('3'); // Por defecto Estudiante
  const [selectedSection, setSelectedSection] = useState(''); // ✅ Sección seleccionada

  useEffect(() => {
    fetchUsuarios();
    fetchSecciones(); // ✅ Obtener secciones
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/estudiantes`);
      const data = await response.json();
      setEstudiantes(data);
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
    }
  };
  const fetchSecciones = async () => {
    try {
      const token = localStorage.getItem('token'); // ✅ Obtener el token de localStorage
      if (!token) {
        throw new Error('⚠️ No se encontró el token en localStorage.');
      }

      const response = await fetch(`${API_URL}/api/secciones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Agregar el token en el header
        }
      });

      if (!response.ok) {
        throw new Error(`⚠️ Error al obtener secciones: ${response.statusText}`);
      }

      const data = await response.json();
      setSecciones(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error('❌ Error al obtener secciones:', error);
      setSecciones([]); // Evita fallos en el mapeo si hay error
    }
};

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

  const agregarUsuario = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }
  
    if (!window.confirm(`¿Seguro que deseas agregar el usuario "${newUserName}" con el perfil seleccionado?`)) {
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("⚠️ No se encontró el token.");
        return;
      }
  
      // ✅ Registrar usuario
      const response = await fetch(`${API_URL}/api/usuarios/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Agregamos el token
        },
        body: JSON.stringify({
          nombre: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          id_rol: parseInt(newUserRole, 10),
        }),
      });
  
      if (!response.ok) throw new Error('Error al registrar usuario.');
      
      const nuevoUsuario = await response.json();
  
      // ✅ Si se seleccionó una sección, asignar al usuario (ya sea Docente o Estudiante)
      if (selectedSection) {
        const sectionResponse = await fetch(`${API_URL}/api/secciones/${selectedSection}/estudiantes`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // ✅ Token para esta solicitud
          },
          body: JSON.stringify({ id_estudiante: nuevoUsuario.id_usuario }),
        });
  
        if (!sectionResponse.ok) throw new Error('Error al asociar usuario con la sección.');
      }
  
      alert("✅ Usuario agregado con éxito.");
      setShowAddModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setSelectedSection('');
      fetchUsuarios(); // ✅ Recargar usuarios sin recargar la página
    } catch (error) {
      console.error('❌ Error al agregar usuario:', error);
      alert('❌ Error al agregar el usuario.');
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

        {/* ✅ Contenedor con flexbox para alinear correctamente */}
        <div className="top-actions">
          <div className="profile-selector">
            <label htmlFor="profile">Seleccionar Perfil</label>
            <select id="profile" value={selectedProfile} onChange={(e) => setSelectedProfile(e.target.value)}>
              <option value="3">Estudiantes</option>
              <option value="2">Docentes</option>
            </select>
          </div>

          {/* ✅ Botón para agregar usuario */}
          <button className="action-button add-user" onClick={() => setShowAddModal(true)}>
            ➕ Agregar usuario
          </button>
        </div>

        <table className="statistics-table">
          <thead>
            <tr>
              <th>Nombre</th>
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
          <button className="pagination-button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Anterior
          </button>
          <span className="pagination-info">Página {currentPage} de {totalPages}</span>
          <button className="pagination-button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Siguiente
          </button>
        </div>
      </div>

      {/* ✅ Modal para agregar usuario */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Agregar Usuario</h3>
            <input type="text" placeholder="Nombre" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
            <input type="email" placeholder="Correo Electrónico" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
              <option value="3">Estudiante</option>
              <option value="2">Docente</option>
            </select>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              <option value="">Selecciona una Sección</option>
              {secciones.map(sec => (
                <option key={sec.id_seccion} value={sec.id_seccion}>
                  {sec.nombre} ({sec.año}-{sec.semestre})
                </option>
              ))}
            </select>
            <div>
            <button className="modal-button confirm" onClick={agregarUsuario}>Agregar</button>
            <button className="modal-button cancel" onClick={() => setShowAddModal(false)}>Cancelar</button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosGeneral;
