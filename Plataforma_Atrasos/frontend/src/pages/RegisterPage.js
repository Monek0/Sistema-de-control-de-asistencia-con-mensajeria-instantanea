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
            {}
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

            <WhatsappLoginModal
                isOpen={showWhatsappModal}
                onRequestClose={() => setShowWhatsappModal(false)}
            />
            
                
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>Registro</h2>

                {error && <p style={styles.error}>{error}</p>}
                {mensajeExito && <p style={styles.success}>{mensajeExito}</p>}


                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label>Nombre de Usuario</label>
                        <input
                            type="text"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>RUT</label>
                        <input
                            type="text"
                            value={rutUsername}
                            onChange={(e) => setRutUsername(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Rol (Código numérico)</label>
                        <input
                            type="number"
                            value={codRol}
                            onChange={(e) => setCodRol(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Confirmar Contraseña</label>
                        <input
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
        </>
    );
};

// Estilos
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
        backgroundColor: '#f7f7f7',
    },
    card: {
        width: '400px',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    input: {
        width: '95%',
        padding: '10px',
        marginTop: '5px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#FF8C00',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: '15px',
    },
    success: {
        color: 'green',
        textAlign: 'center',
        marginBottom: '15px',
    },
    whatsappButton: {
        padding: '10px 15px',
        backgroundColor: '#01579b',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.3s',
        marginBottom: '20px',
    },
    
    
};

export default RegisterPage;
