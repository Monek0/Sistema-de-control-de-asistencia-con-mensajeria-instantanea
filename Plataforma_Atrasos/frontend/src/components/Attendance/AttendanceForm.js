import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://api.edupuntual.cl';


const AttendanceForm = ({ onSuccess, currentData }) => {
    const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
    const [nombreAlumno, setNombreAlumno] = useState(''); // Estado para almacenar el nombre del alumno
    const [mostrarJustificativo, setMostrarJustificativo] = useState(false); // Control para mostrar justificativos
    const [fechaAtrasos, setFechaAtraso] = useState(new Date());
    const [error, setError] = useState('');
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [baucherPath, setBaucherPath] = useState(null); // Ruta del baucher generado
    const rutInputRef = useRef(null);

    useEffect(() => {
        if (!currentData) {
            resetForm();
        } else {
            setRutAlumno(currentData.rutAlumno);
            setFechaAtraso(new Date());
            setError('');
        }
        rutInputRef.current?.focus();
    }, [currentData]);

    useEffect(() => {
        const timer = setInterval(() => setFechaAtraso(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const resetForm = () => {
        setRutAlumno('');
        setNombreAlumno('');
        setMostrarJustificativo(false);
        setFechaAtraso(new Date());
        setError('');
        setBaucherPath(null); // Limpiar la ruta del baucher
        rutInputRef.current?.focus();
    };

    const validarRutExistente = async (rut) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/alumnos/verificar/${rut}`);
            return response.data.exists;
        } catch (error) {
            console.error('Error al validar RUT:', error);
            throw new Error('Error al validar el RUT');
        }
    };

    // const obtenerDatosAlumno = async (rut) => {
    //     try {
    //         const response = await axios.get(`${API_BASE_URL}/api/alumnos/${rut}`);
    //         if (response.status === 200) {
    //             const { nombre, justificativo } = response.data;
    //             setNombreAlumno(nombre);
    //             setMostrarJustificativo(justificativo); // Determinar si hay justificativos
    //         }
    //     } catch (error) {
    //         console.error('Error al obtener los datos del alumno:', error);
    //         setNombreAlumno('');
    //         setMostrarJustificativo(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBaucherPath(null); // Limpiar cualquier baucher anterior

        try {
            // Validar que el RUT existe antes de enviar el formulario
            const rutExiste = await validarRutExistente(rutAlumno);
            if (!rutExiste) {
                setError('El RUT ingresado no existe en la base de datos');
                return;
            }

            // Obtener datos adicionales del alumno antes de enviar
            //await obtenerDatosAlumno(rutAlumno);

            // Enviar datos al backend para registrar el atraso
            const url = currentData
                ? `${API_BASE_URL}/api/atrasos/${currentData.id}`
                : `${API_BASE_URL}/api/atrasos`;
            const method = currentData ? axios.put : axios.post;
            const response = await method(url, { rutAlumno, fechaAtrasos });

            if (response.status === 201) {
                const { baucherPath } = response.data; // Ruta del PDF generada en el backend
                setSuccessMessage('Atraso registrado con éxito.');
                setBaucherPath(baucherPath);
                setNotificationVisible(true);
                if (onSuccess) onSuccess();
                resetForm();

                // Abre el PDF en una nueva ventana para ver/descargar/print
                window.open(`${API_BASE_URL}${baucherPath}`, '_blank');
            } else {
                setError('Error al registrar el atraso.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al guardar el atraso: ' + err.message;
            setError(errorMessage);
        }
    };

    const handleDownloadBaucher = () => {
        if (baucherPath) {
            window.open(`${API_BASE_URL}/${baucherPath}`, '_blank'); // Abrir el PDF en una nueva ventana
        }
    };

    useEffect(() => {
        if (notificationVisible) {
            const timer = setTimeout(() => setNotificationVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [notificationVisible]);

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '500px',
            margin: '40px auto',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
        },
        title: {
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '24px',
            color: '#333',
        },
        form: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        label: {
            width: '100%',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#555',
        },
        inputContainer: {
            display: 'flex',
            width: '100%',
            marginBottom: '20px',
            gap: '10px',
        },
        input: {
            flex: '1',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
        },
        button: {
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
        },
        dateDisplay: {
            width: '100%',
            padding: '10px',
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#555',
            marginBottom: '20px',
            fontSize: '18px',
        },
        error: {
            color: '#dc3545',
            textAlign: 'center',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px',
            width: '100%',
        },
        notification: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        },
        link: {
            color: '#007bff',
            textDecoration: 'underline',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{currentData ? 'Editar Atraso' : 'Registrar Atraso'}</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>RUT Alumno</label>
                <div style={styles.inputContainer}>
                    <input
                        ref={rutInputRef}
                        type="text"
                        value={rutAlumno}
                        onChange={(e) => setRutAlumno(e.target.value)}
                        placeholder="Ingrese RUT"
                        required
                        style={styles.input}
                    />
                </div>
                {nombreAlumno && (
                    <p style={{ color: '#333', fontWeight: 'bold' }}>
                        Alumno: {nombreAlumno} {mostrarJustificativo ? '(Con justificativo)' : '(Sin justificativo)'}
                    </p>
                )}
                <label style={styles.label}>Fecha y Hora Actual</label>
                <div style={styles.dateDisplay}>
                    {fechaAtrasos.toLocaleString()}
                </div>
                <button type="submit" style={{ ...styles.button, width: '100%' }}>
                    {currentData ? 'Actualizar' : 'Guardar'}
                </button>
            </form>
            {baucherPath && (
                <p style={styles.link} onClick={handleDownloadBaucher}>
                    Descargar baucher
                </p>
            )}
            {notificationVisible && <div style={styles.notification}>{successMessage}</div>}
        </div>
    );
};

export default AttendanceForm;