import React, { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import WhatsappLoginModal from '../components/WhatsappLoginModal';

const RegisterPage = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [rutUsername, setRutUsername] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [codRol, setCodRol] = useState('');
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombreUsuario || !rutUsername || !contrasena || !confirmarContrasena || !codRol) {
            setError('Por favor, rellena todos los campos');
            setMensajeExito('');
            return;
        }

        if (contrasena !== confirmarContrasena) {
            setError('Las contraseñas no coinciden');
            setMensajeExito('');
            return;
        }

        try {
            await register({
                nombreUsuario,
                rutUsername,
                contrasena,
                codRol: parseInt(codRol)
            });

            setError('');
            setMensajeExito('Usuario registrado correctamente');

            setTimeout(() => {
                navigate('/home');
            }, 2000);
        } catch (err) {
            setMensajeExito('');
            setError(err.message || 'Error al registrar el usuario');
        }
    };

    return (
        <>
            {/* Contenedor principal */}
            <div style={styles.mainContainer}>
                {/* Botón de WhatsApp en esquina superior izquierda */}
                <div style={styles.whatsappContainer}>
                    <button
                        onClick={() => setShowWhatsappModal(true)}
                        style={styles.whatsappButton}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#013f73'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#01579b'}
                    >
                        Iniciar sesión con WhatsApp
                    </button>
                </div>

                {/* Contenedor del formulario centrado */}
                <div style={styles.container}>
                    <div style={styles.card}>
                        <h2 style={styles.header}>Registro</h2>

                        {error && <p style={styles.error}>{error}</p>}
                        {mensajeExito && <p style={styles.success}>{mensajeExito}</p>}

                        <form onSubmit={handleSubmit}>
  <div style={styles.formGroup}>
    <label htmlFor="nombreUsuario">Nombre de Usuario</label>
    <input
      id="nombreUsuario"
      type="text"
      value={nombreUsuario}
      onChange={(e) => setNombreUsuario(e.target.value)}
      style={styles.input}
    />
  </div>
  <div style={styles.formGroup}>
    <label htmlFor="rutUsername">RUT</label>
    <input
      id="rutUsername"
      type="text"
      value={rutUsername}
      onChange={(e) => setRutUsername(e.target.value)}
      style={styles.input}
    />
  </div>
  <div style={styles.formGroup}>
    <label htmlFor="codRol">Rol (Código numérico)</label>
    <input
      id="codRol"
      type="number"
      value={codRol}
      onChange={(e) => setCodRol(e.target.value)}
      style={styles.input}
    />
  </div>
  <div style={styles.formGroup}>
    <label htmlFor="contrasena">Contraseña</label>
    <input
      id="contrasena"
      type="password"
      value={contrasena}
      onChange={(e) => setContrasena(e.target.value)}
      style={styles.input}
    />
  </div>
  <div style={styles.formGroup}>
    <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
    <input
      id="confirmarContrasena"
      type="password"
      value={confirmarContrasena}
      onChange={(e) => setConfirmarContrasena(e.target.value)}
      style={styles.input}
    />
  </div>
  <button type="submit" style={styles.button}>Registrar</button>
</form>

                    </div>
                </div>
            </div>

            <WhatsappLoginModal
                isOpen={showWhatsappModal}
                onRequestClose={() => setShowWhatsappModal(false)}
            />
        </>
    );
};

// Estilos
const styles = {
    mainContainer: {
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#f7f7f7',
    },
    whatsappContainer: {
        position: 'absolute',
        top: '1.25rem',
        left: '1.25rem',
        zIndex: 1000,
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f7f7f7',
        padding: '1.25rem',
    },
    card: {
        width: '25rem',
        padding: '2.5rem',
        borderRadius: '1.25rem',
        boxShadow: '0 0.25rem 0.50rem rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
    },
    header: {
        textAlign: 'center',
        marginBottom: '1.25rem',
    },
    formGroup: {
        marginBottom: '0.9375rem ',
    },
    input: {
        width: '95%',
        padding: '0.625rem',
        marginTop: '0.3125rem',
        borderRadius: '0.25rem',
        border: '1px solid #ccc',
    },
    button: {
        width: '100%',
        backgroundColor: '#FF8C00',
        color: '#fff',
        border: 'none',
        borderRadius: '0.25rem',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '1rem',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: '0.9375rem ',
    },
    success: {
        color: 'green',
        textAlign: 'center',
        marginBottom: '0.9375rem ',
    },

    whatsappButton: {
        padding: '0.625rem 0.9375rem',
        backgroundColor: '#01579b',
        color: '#fff',
        border: 'none',
        borderRadius: '0.3125rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.3s',
        fontSize: '0.875rem',
    },
};

export default RegisterPage;
