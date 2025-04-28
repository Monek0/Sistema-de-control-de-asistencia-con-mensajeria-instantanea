import React, { useState} from 'react';
import AttendanceForm from '../components/Attendance/AttendanceForm';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://api.edupuntual.cl';

const AttendancePage = () => {
    const [rut, setRut] = useState('');
    const [errorRut, setErrorRut] = useState('');
    const [recentAttendance, setRecentAttendance] = useState([]);

    const styles = {
        pageContainer: {
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
            minHeight: '70vh',
            maxWidth: '167vh',
            backgroundColor: '#f5f7fa',
        },
        card: {
            flex: 1,
            maxWidth: '1600px',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        sectionTitle: {
            marginTop: '20px',
            fontSize: '20px',
            fontWeight: '600',
            color: '#333',
        },
        listItem: {
            padding: '8px 0',
            borderBottom: '1px solid #eee',
        }
    };

    // Función para validar el RUT de manera básica
    const validateRut = (rutInput) => {
        if (!rutInput) {
            setErrorRut('Debes ingresar un RUT.');
            return false;
        }
        if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutInput)) {
            setErrorRut('Formato de RUT inválido. Ej: 12345678-9');
            return false;
        }
        setErrorRut('');
        return true;
    };

    const handleRutChange = (e) => {
        const newRut = e.target.value;
        setRut(newRut);
        validateRut(newRut);

        if (newRut && /^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(newRut)) {
            fetchRecentAttendance(newRut);
        } else {
            setRecentAttendance([]);
        }
    };

    const fetchRecentAttendance = async (rut) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE_URL}/api/atrasos/recent/${rut}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecentAttendance(data.slice(0, 5)); // Solo mostrar los 5 más recientes
        } catch (error) {
            console.error('Error al obtener historial:', error);
            setRecentAttendance([]);
        }
    };

    // Simulación de función que mostraría el Toast cuando el registro sea exitoso
    const handleSuccessfulRegister = () => {
        toast.success('Atraso registrado exitosamente 🎉');
    };

    return (
        <div style={styles.pageContainer}>
            <ToastContainer position="bottom-right" />

            <motion.div
                style={styles.card}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Control de Atrasos</h1>

                {/* Formulario de control */}
                <AttendanceForm
                    rut={rut}
                    onRutChange={handleRutChange}
                    onSuccessfulRegister={handleSuccessfulRegister}
                />

                {/* Validación de RUT */}
                {errorRut && (
                    <div style={{ color: 'red', marginTop: '10px' }}>
                        {errorRut}
                    </div>
                )}

                
                {recentAttendance.map((atraso, idx) => (
                    <div key={idx} style={styles.listItem}>
                        {new Date(atraso.fecha_atrasos).toLocaleString()} — {atraso.justificativo ? 'Justificado' : 'No Justificado'}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default AttendancePage;
