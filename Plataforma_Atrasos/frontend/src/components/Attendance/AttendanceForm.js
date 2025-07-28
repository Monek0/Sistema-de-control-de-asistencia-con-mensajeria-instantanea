import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

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

    const toastId = toast.loading('Registrando y enviando atraso a apoderado/a…');

    try {
      const rutExiste = await validarRutExistente(rutAlumno);
      if (!rutExiste) {
        toast.update(toastId, {
          render: 'El RUT ingresado no existe en la base de datos',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        });
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
        toast.update(toastId, {
          render: 'Atraso registrado con éxito 🎉',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });

        if (onSuccess) onSuccess();
        resetForm();
        window.open(`${API_BASE_URL}${baucherPath}`, '_blank');
      } else {
        setError('Error al registrar el atraso.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message;
      toast.update(toastId, {
        render: `Error: ${msg}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
      setError(msg);
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
    if (valor.length <= 1) 
      return valor;
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1).toUpperCase();
    return `${cuerpo}-${dv}`;
  };

  const styles = {
    mainContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '2rem',
      marginTop: '2rem',
      padding: '1.25rem',
      flexWrap: 'wrap'
    },
    datetimeBox: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f8ff',
      padding: '1.25rem',
      borderRadius: '0.5rem',
      boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)',
      width: '100%',
      minWidth: '18rem',
      minHeight: '18rem',
      maxWidth: '25rem'
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f8ff',
      padding: '1.25rem',
      borderRadius: '0.5rem',
      boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)',
      width: '98%',
      minWidth: '18rem',
      minHeight: '18rem',
      maxWidth: '25rem'
    },
    iconAndText1: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      color: '#01579b',
      fontWeight: 'bold',
      fontSize: '2.5rem',
      marginBottom: '1.5rem'
    },
    iconAndText2: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      color: '#01579b',
      fontWeight: 'bold',
      fontSize: '2.75rem',
      marginBottom: '1.5rem'
    },
    icon: {
      fontSize: '4.375rem'
    },
    title: {
      textAlign: 'center',
      marginBottom: '1.25rem',
      fontSize: '1.5rem',
      color: '#333'
    },
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    label: {
      width: '100%',
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      color: '#555'
    },
    inputContainer: {
      display: 'flex',
      width: '100%',
      marginBottom: '1.25rem',
      gap: '0.625rem'
    },
    input: {
      flex: '1',
      padding: '0.625rem',
      borderRadius: '0.25rem',
      border: '1px solid #ddd'
    },
    button: {
      padding: '0.625rem 0.9375rem',
      backgroundColor: '#01579b',
      color: 'white',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      width: '100%',
      marginTop: '0.625rem'
    },
    error: {
      color: '#dc3545',
      textAlign: 'center',
      marginBottom: '0.9375rem',
      padding: '0.625rem',
      backgroundColor: '#ffe6e6',
      borderRadius: '0.25rem',
      width: '100%'
    },
    notification: {
      position: 'fixed',
      bottom: '1.25rem',
      right: '1.25rem',
      backgroundColor: '#28a745',
      color: 'white',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.3125rem',
      boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)'
    },
    link: {
      color: '#007bff',
      textDecoration: 'underline',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.mainContainer}>
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
