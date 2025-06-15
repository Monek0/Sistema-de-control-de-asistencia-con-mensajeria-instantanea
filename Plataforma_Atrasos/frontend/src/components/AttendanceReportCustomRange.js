import React, { useState } from 'react';
import axios from 'axios';

const getBackendURL = () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://api.edupuntual.cl';
};  

const AttendanceReportCustomRange = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            setError('Por favor, selecciona ambas fechas.');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
            return;
        }

        setLoading(true);
        setError('');
        setReportData(null);

        try {
            const response = await axios.get(`${getBackendURL()}/api/atrasos/rango`, {
                params: {
                    startDate,
                    endDate,
                },
            });

            setReportData(response.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Error al obtener el reporte.');
            }
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
        datePicker: {
            display: 'flex',
            flexDirection: 'column',
        },
        dateLabel: {
            marginBottom: '0.3125rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#333',
        },
        input: {
            padding: '0.625rem',
            border: '0.0625rem solid #ccc',
            borderRadius: '0.3125rem',
            fontSize: '0.875rem',
            width: '11.25rem',
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
            alignSelf: 'flex-end',
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
        reportContainer: {
            marginTop: '1.25rem',
        },
        reportTitle: {
            fontSize: '1.125rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#333',
        },
        tableContainer: {
            maxHeight: '25rem',
            overflowY: 'auto',
            border: '0.0625rem solid #ddd',
            borderRadius: '0.5rem',
            boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.05)',
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
            <h2 style={styles.title}>Reporte de Atrasos por Rango de Fechas</h2>
            
            <div style={styles.header}>
                <div style={styles.datePicker}>
                    <label htmlFor="startDate" style={styles.dateLabel}>Fecha de Inicio:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.datePicker}>
                    <label htmlFor="endDate" style={styles.dateLabel}>Fecha de Fin:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <button onClick={handleGenerateReport} style={styles.button}>
                    Generar Reporte
                </button>
            </div>

            {loading && <p style={styles.loadingMessage}>Cargando reportes...</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}

            {reportData && (
                <div style={styles.reportContainer}>
                    <h3 style={styles.reportTitle}>
                        Reporte de Atrasos del {new Date(reportData.startDate).toLocaleDateString()} al{' '}
                        {new Date(reportData.endDate).toLocaleDateString()}
                    </h3>
                    {reportData.atrasos.length > 0 ? (
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
                                    {reportData.atrasos.map((atraso, index) => (
                                        <tr key={index} style={styles.tr}>
                                            <td style={styles.td}>{atraso.rut_alumno}</td>
                                            <td style={styles.td}>{atraso.nombre_completo}</td>
                                            <td style={styles.td}>{atraso.nombre_curso}</td>
                                            <td style={styles.td}>
                                                {atraso.tipo_justificativo && atraso.tipo_justificativo !== 'Sin justificativo' ? atraso.tipo_justificativo : 'No'}
                                            </td>
                                            <td style={styles.td}>{new Date(atraso.fecha_atrasos).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={styles.noDataMessage}>No se encontraron atrasos en este rango de fechas.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendanceReportCustomRange;