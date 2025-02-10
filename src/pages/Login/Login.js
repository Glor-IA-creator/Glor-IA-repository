import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../assets/Logo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  // ✅ Verificar si el usuario ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .get(`${API_URL}/api/usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const { rol } = response.data;
        redirigirSegunRol(rol);
      })
      .catch(() => {
        localStorage.removeItem('token'); 
      });
  }, [navigate, API_URL]);

  // ✅ Función para redirigir según el rol
  const redirigirSegunRol = (rol) => {
    if (rol === 'estudiante') navigate('/alumno/home', { replace: true });
    else if (rol === 'profesor') navigate('/admin/home', { replace: true });
    else if (rol === 'admin') navigate('/general/home', { replace: true });
    else setError('⚠️ Rol no reconocido. Contacte con el administrador.');
  };

  // ✅ Manejo del login con validaciones
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/usuarios/login`, {
        email,
        password,
      });

      const { token, rol, enabled, ultimo_acceso } = response.data;

      // ✅ Bloquear acceso si el usuario está deshabilitado
      if (!enabled) {
        setError('⚠️ Tu cuenta está deshabilitada. Contacta con un administrador.');
        return;
      }

      // ✅ Guardar datos en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('ultimo_acceso', ultimo_acceso || new Date().toISOString());

      // ✅ Redirigir según el rol
      redirigirSegunRol(rol);

    } catch (err) {
      setError(err.response?.data?.message || '❌ Credenciales inválidas');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={Logo} alt="Logo" className="login-logo" />
        <div className="login-welcome-text">
          <p className="highlighted">¡Bienvenidos a nuestra Plataforma UGM!</p>
          <p>LA MENTE NO DOMINA AL CUERPO, SINO QUE SE</p>
          <p>CONVIERTE EN CUERPO.</p>
          <p><strong>CUERPO Y MENTE SON UNA SOLA COSA</strong></p>
        </div>
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Iniciar sesión</h2>
          {error && <p className="error-message">{error}</p>}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
