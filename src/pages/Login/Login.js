import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoGloria from '../../assets/LogoGLORIA.svg';
import Logo from '../../assets/Logo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  // Verificar si el usuario ya está autenticado
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

  // Función para redirigir según el rol
  const redirigirSegunRol = (rol) => {
    if (rol === 'estudiante') navigate('/alumno/home', { replace: true });
    else if (rol === 'profesor') navigate('/admin/home', { replace: true });
    else if (rol === 'admin') navigate('/general/home', { replace: true });
    else setError('⚠️ Rol no reconocido. Contacte con el administrador.');
  };

  // Manejo del login con validaciones
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/usuarios/login`, {
        email,
        password,
      });

      const { token, rol, enabled, ultimo_acceso } = response.data;

      // Bloquear acceso si el usuario está deshabilitado
      if (!enabled) {
        setError('⚠️ Tu cuenta está deshabilitada. Contacta con un administrador.');
        return;
      }

      // Guardar datos en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem(
        'ultimo_acceso',
        ultimo_acceso || new Date().toISOString()
      );

      // Redirigir según el rol
      redirigirSegunRol(rol);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Credenciales inválidas');
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-left">
          <img src={Logo} alt="Logo" className="login-logo" />

          {/* Caja con fondo semitransparente para el texto */}
          <div className="login-info-box">
            <p>
              <strong>Filmado en 1965 por el Dr. Shostrom</strong>, el caso Gloria
              muestra a tres psicoterapeutas pioneros:
            </p>
            <p>
              <strong>Carl Rogers</strong> (Terapia Humanista),{' '}
              <strong>Fritz Perls</strong> (Terapia Gestalt) y{' '}
              <strong>Albert Ellis</strong> (Terapia Racional Emotiva), comparando
              sus enfoques.
            </p>
            <p>
              Inspirados en esta experiencia, nace <strong>Glor-IA</strong>,
              plataforma de aprendizaje para el desarrollo de competencias
              clínicas, basados en Inteligencia Artificial.
            </p>
          </div>
        </div>

        <div className="login-right">
          <form className="login-form" onSubmit={handleLogin}>
            <img src={LogoGloria} alt="LogoGloria" className="logo-form" />
            <h2>Iniciar sesión</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ backgroundColor: '#C5EBFF' }}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ backgroundColor: '#C5EBFF' }}
              />
            </div>

            <button type="submit">Entrar</button>
          </form>
        </div>
      </div>
      <footer className="login-footer">
        Glor-IA.com es marca registrada por Universidad Gabriela Mistral - 2024. Todos los derechos reservados.
      </footer>
    </>
  );
};

export default Login;
