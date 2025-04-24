import React, { useState } from 'react';
import './LoginPage.css';
import { login } from '../services/authService';
import { Eye, EyeOff } from 'lucide-react'; 

const LoginPage = () => {
  const [rutUsername, setRutUsername] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rutUsername || !contraseña) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
        await login(rutUsername, contraseña);
        localStorage.setItem('rut_username', rutUsername);
        window.location.href = '/home';
    } catch (err) {
        
    
        if (err.response && err.response.status === 400) {
            
            setError(err.response.data?.message || "RUT o contraseña incorrectos.");
        } else if (err.message) {
         
            setError(err.message);
        } else {
            setError("Ocurrió un error inesperado. Por favor, inténtalo más tarde.");
        }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Inicio de Sesión</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>RUT</label>
            <input
              type="text"
              value={rutUsername}
              onChange={(e) => setRutUsername(e.target.value)}
              placeholder="Ej: 12.345.678-9"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
