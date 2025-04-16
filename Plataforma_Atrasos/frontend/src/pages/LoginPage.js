import React, { useState } from 'react';
import './LoginPage.css';
import { login } from '../services/authService';

const LoginPage = () => {
    const [rutUsername, setRutUsername] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de campos vacíos
        if (!rutUsername || !contraseña) {
            setError("Por favor, completa todos los campos.");
            return;
        }

        try {
            // Intento de inicio de sesión
            await login(rutUsername, contraseña);
            localStorage.setItem('rut_username', rutUsername); // Guardar RUT en localStorage
            window.location.href = '/home'; // Redirigir a la página de inicio
        } catch (err) {
            // Manejo de errores de autenticación
            if (err.response && err.response.status === 401) {
                setError("RUT o contraseña incorrectos. Intenta de nuevo.");
            } else {
                setError("Ocurrió un error inesperado. Por favor, inténtalo más tarde.");
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Inicio de Sesión</h2>
                {/* Mostrar mensaje de error si existe */}
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>RUT</label>
                        <input
                            type="text"
                            value={rutUsername}
                            onChange={(e) => setRutUsername(e.target.value)}
                            aria-label="Ingrese su RUT"
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <div className="input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={contraseña}
                                onChange={(e) => setContraseña(e.target.value)}
                                aria-label="Ingrese su contraseña"
                            />
                            <i
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? '' : ''}
                            </i>
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
