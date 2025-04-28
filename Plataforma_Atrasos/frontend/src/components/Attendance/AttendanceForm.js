import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://api.edupuntual.cl';

const AttendanceForm = ({ onSuccess, currentData }) => {
  const [rutAlumno, setRutAlumno] = useState(currentData?.rutAlumno || '');
  const [nombreAlumno, setNombreAlumno] = useState('');
  const [mostrarJustificativo, setMostrarJustificativo] = useState(false);
  const [fechaAtrasos, setFechaAtraso] = useState(new Date());
  const [error, setError] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [baucherPath, setBaucherPath] = useState(null);
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
    setBaucherPath(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBaucherPath(null);

    try {
      const rutExiste = await validarRutExistente(rutAlumno);
      if (!rutExiste) {
        setError('El RUT ingresado no existe en la base de datos');
        return;
      }

      const url = currentData
        ? `${API_BASE_URL}/api/atrasos/${currentData.id}`
        : `${API_BASE_URL}/api/atrasos`;
      const method = currentData ? axios.put : axios.post;
      const response = await method(url, { rutAlumno, fechaAtrasos });

      if (response.status === 201) {
        const { baucherPath } = response.data;
        setSuccessMessage('Atraso registrado con éxito.');
        setBaucherPath(baucherPath);
        setNotificationVisible(true);
        if (onSuccess) onSuccess();
        resetForm();
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
      window.open(`${API_BASE_URL}/${baucherPath}`, '_blank');
    }
  };

  useEffect(() => {
    if (notificationVisible) {
      const timer = setTimeout(() => setNotificationVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationVisible]);

  const formatearRut = (valor) => {
    valor = valor.replace(/[^0-9kK]/g, '');
    if (valor.length <= 1) return valor;

    const cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();
    let cuerpoFormateado = '';
    for (let i = cuerpo.length - 1, j = 1; i >= 0; i--, j++) {
      cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
      if (j % 3 === 0 && i !== 0) {
        cuerpoFormateado = '.' + cuerpoFormateado;
      }
    }
    return `${cuerpoFormateado}-${dv}`;
  };

  const styles = {
    mainContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '30px',
        marginTop: '30px',
        padding: '20px',
        flexWrap: 'wrap',
        },
        
    datetimeBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',       // Azul clarito
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        minWidth: '300px',
        minHeight: '300px',
        maxWidth: '400px',
    },
        
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8ff',       // 🔵 Ahora mismo color que datetimeBox
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        minWidth: '300px',
        minHeight: '300px',
        maxWidth: '400px',
    },
        
    iconAndText1: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#01579b',
        fontWeight: 'bold',
        fontSize: '40px',       // 🔥 Más grande
        marginBottom: '25px',
    },
    iconAndText2: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#01579b',
        fontWeight: 'bold',
        fontSize: '45px',       // 🔥 Más grande
        marginBottom: '25px',
    },
        
    icon: {
        fontSize: '70px',        // 🔥 Más grande aún
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
        backgroundColor: '#01579b',   // 🔵 Igual que el sidebar
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '100%',
        marginTop: '10px',
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
    <div style={styles.mainContainer}>
      {/* Bloque Izquierdo: Fecha y Hora */}
      <div style={styles.datetimeBox}>
        <div style={styles.iconAndText1}>
            <FaCalendarAlt style={styles.icon} />
            <span>{fechaAtrasos.toLocaleDateString()}</span>
        </div>
        <div style={styles.iconAndText2}>
            <FaClock style={styles.icon} />
            <span>{fechaAtrasos.toLocaleTimeString()}</span>
        </div>
        </div>



      {/* Bloque Derecho: Formulario */}
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
              onChange={(e) => setRutAlumno(formatearRut(e.target.value))}
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
          <button type="submit" style={styles.button}>
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
    </div>
  );
};

export default AttendanceForm;
