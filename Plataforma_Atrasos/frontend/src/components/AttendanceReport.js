import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const getBackendURL = () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://api.edupuntual.cl';
};  

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
            const response = await axios.get(`${getBackendURL()}/api/atrasos/dia?fecha=${formattedDate}`);
            setReportes(response.data); 
        } catch (error) {
            setError('Error al obtener los reportes. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            marginTop: '0.0625rem',
            padding: '1.25rem',
            border: '0.0625rem solid #ccc',
            borderRadius: '0.5rem',
            boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)',
            maxWidth: '93.75rem',
            marginLeft: '1.875rem',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"Roboto", sans-serif',
        },
        title: {
            textAlign: 'center',
            marginBottom: '0.9375rem',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#333',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.9375rem',
        },
        datepicker: {
            display: 'inline-block',
            width: '60%',
        },
        datePickerInput: {
            padding: '0.625rem',
            border: '0.0625rem solid #ccc',
            borderRadius: '0.3125rem',
            fontSize: '0.875rem',
            width: '100%',
            outline: 'none',
            transition: 'border-color 0.3s ease',
        },
        button: {
            padding: '0.625rem 0.9375rem',
            backgroundColor: 'rgb(1, 87, 155)',
            color: 'white',
            border: 'none',
            borderRadius: '0.3125rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'background-color 0.3s ease',
        },
        loadingMessage: {
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#666',
        },
        errorMessage: {
            color: 'red',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 'bold',
        },
        tableContainer: {
            maxHeight: '25rem',
            overflowY: 'auto',
            border: '0.0625rem solid #ddd',
            borderRadius: '0.5rem',
            boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.05)',
            marginTop: '1.25rem',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.75rem',
        },
        th: {
            backgroundColor: 'rgb(1, 87, 155)',
            color: 'white',
            padding: '0.5rem',
            textAlign: 'left',
            fontSize: '0.875rem',
            fontWeight: '500',
            position: 'sticky',
            top: 0,
            zIndex: 1,
        },
        td: {
            border: '0.0625rem solid #ddd',
            padding: '0.5rem',
            fontSize: '0.75rem',
            backgroundColor: '#f9f9f9',
        },
        tr: {
            transition: 'background-color 0.3s ease',
        },
        noDataMessage: {
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#666',
            fontStyle: 'italic',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Reportes de Atrasos</h2>
            
            <div style={styles.header}>
                <div style={styles.datepicker}>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Seleccionar fecha"
                        customInput={<input style={styles.datePickerInput} />}
                    />
                </div>
                <button onClick={fetchReportsByDate} style={styles.button}>
                    Filtrar
                </button>
            </div>

            {loading && <p style={styles.loadingMessage}>Cargando reportes...</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}
            
            {reportes.length > 0 ? (
                <div style={styles.tableContainer}>
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
                                <tr key={reporte.cod_atrasos} style={styles.tr}>
                                    <td style={styles.td}>{reporte.rut_alumno}</td>
                                    <td style={styles.td}>{reporte.nombre_completo || 'No disponible'}</td>
                                    <td style={styles.td}>{reporte.nombre_curso || 'No disponible'}</td>
                                    <td style={styles.td}>
                                        {reporte.tipo_justificativo && reporte.tipo_justificativo !== 'Sin justificativo' ? reporte.tipo_justificativo : 'No'}
                                    </td>
                                    <td style={styles.td}>{new Date(reporte.fecha_atrasos).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && <p style={styles.noDataMessage}>No hay reportes disponibles para la fecha seleccionada.</p>
            )}
        </div>
    );
};

export default AttendanceReport;