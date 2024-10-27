import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AttendanceReport = () => {
    const [reportes, setReportes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReportsByDate = async () => {
        if (!selectedDate) {
            alert("Por favor selecciona una fecha.");
            return;
        }
    
        try {
            setLoading(true);
            setError(null);
            const formattedDate = selectedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const response = await axios.get(`http://localhost:3000/api/atrasos/dia?fecha=${formattedDate}`);
            setReportes(response.data); 
        } catch (error) {
            setError('Error al obtener los reportes. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            marginTop: '1px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            maxWidth: '1500px',
            marginLeft: '30px',
            display: 'flex',
            flexDirection: 'column',
        },
        reportContainer: {
            flex: 1,
            marginRight: '20px',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
        },
        datepicker: {
            display: 'inline-block',
            marginRight: '10px',
            width: '60%',
        },
        button: {
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
        },
        th: {
            backgroundColor: '#007bff',
            color: 'white',
            padding: '8px',
            textAlign: 'left',
            fontSize: '14px',
        },
        td: {
            border: '1px solid #ddd',
            padding: '8px',
            fontSize: '12px',
        },
        list: {
            marginTop: '20px',
            padding: 0,
            listStyle: 'none',
            maxHeight: '300px', // Limitar la altura
            overflowY: 'auto', // Habilitar barra de desplazamiento
        },
        listItem: {
            padding: '8px',
            borderBottom: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
            borderRadius: '5px',
            marginBottom: '10px',
            fontSize: '12px',
        },
        errorMessage: {
            color: 'red',
            textAlign: 'center',
        },
        loadingMessage: {
            textAlign: 'center',
        },
        title: {
            textAlign: 'center',
            marginBottom: '15px',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.reportContainer}>
                <h2 style={styles.title}>Reportes de Atrasos</h2>
                <div style={styles.header}>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Seleccionar fecha"
                        style={styles.datepicker}
                    />
                    <button onClick={fetchReportsByDate} style={styles.button}>
                        Filtrar
                    </button>
                </div>

                {loading && <p style={styles.loadingMessage}>Cargando reportes...</p>}
                {error && <p style={styles.errorMessage}>{error}</p>}
                
                {reportes.length > 0 ? (
                    <div style={styles.list}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>RUT</th>
                                    <th style={styles.th}>Nombre</th>
                                    <th style={styles.th}>Curso</th>
                                    <th style={styles.th}>Justificativo</th>
                                    <th style={styles.th}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportes.map((reporte) => (
                                    <tr key={reporte.COD_ATRASOS}>
                                        <td style={styles.td}>{reporte.RUT_ALUMNO}</td>
                                        <td style={styles.td}>{reporte.NOMBRE_COMPLETO || 'No disponible'}</td>
                                        <td style={styles.td}>{reporte.NOMBRE_CURSO || 'No disponible'}</td>
                                        <td style={styles.td}>
                                            {reporte.TIPO_JUSTIFICATIVO && reporte.TIPO_JUSTIFICATIVO !== 'Sin justificativo' ? reporte.TIPO_JUSTIFICATIVO : 'No'}
                                        </td>
                                        <td style={styles.td}>{new Date(reporte.FECHA_ATRASOS).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    !loading && <p>No hay reportes disponibles para la fecha seleccionada.</p>
                )}
            </div>
        </div>
    );
};

export default AttendanceReport;