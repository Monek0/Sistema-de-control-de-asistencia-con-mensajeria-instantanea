import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AttendanceReportCustomRange = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showChart, setShowChart] = useState(false);
    const [chartData, setChartData] = useState([]);

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
        setShowChart(false);
        setChartData([]);

        try {
            const response = await axios.get('http://localhost:3000/api/atrasos/rango', {
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

    const processChartData = () => {
        if (!reportData || !reportData.atrasos) {
            return [];
        }

        const counts = {};

        reportData.atrasos.forEach((atraso) => {
            const date = new Date(atraso.FECHA_ATRASOS).toLocaleDateString();
            counts[date] = (counts[date] || 0) + 1;
        });

        const data = Object.keys(counts).map((date) => ({
            fecha: date,
            cantidad: counts[date],
        }));

        data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        return data;
    };

    const toggleChart = () => {
        if (!showChart) {
            const data = processChartData();
            setChartData(data);
        }
        setShowChart((prev) => !prev);
    };

    return (
        <div style={styles.container}>
            <h2>Reporte de Atrasos por Rango de Fechas</h2>
            <div style={styles.inputContainer}>
                <div style={styles.datePicker}>
                    <label htmlFor="startDate">Fecha de Inicio:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.datePicker}>
                    <label htmlFor="endDate">Fecha de Fin:</label>
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

            {loading && <p>Cargando...</p>}
            {error && <p style={styles.error}>{error}</p>}

            {reportData && (
                <div style={styles.reportContainer}>
                    <h3>
                        Reporte de Atrasos del {new Date(reportData.startDate).toLocaleDateString()} al{' '}
                        {new Date(reportData.endDate).toLocaleDateString()}
                    </h3>
                    {reportData.atrasos.length > 0 ? (
                        <>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>RUT Alumno</th>
                                            <th style={styles.th}>Nombre Completo</th>
                                            <th style={styles.th}>Curso</th>
                                            <th style={styles.th}>Fecha de Atraso</th>
                                            <th style={styles.th}>Justificativo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.atrasos.map((atraso, index) => (
                                            <tr key={index} style={styles.tr}>
                                                <td style={styles.td}>{atraso.RUT_ALUMNO}</td>
                                                <td style={styles.td}>{atraso.NOMBRE_COMPLETO}</td>
                                                <td style={styles.td}>{atraso.NOMBRE_CURSO}</td>
                                                <td style={styles.td}>{new Date(atraso.FECHA_ATRASOS).toLocaleString()}</td>
                                                <td style={styles.td}>{atraso.JUSTIFICATIVO ? 'Sí' : 'No'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                onClick={toggleChart}
                                style={styles.chartButton}
                                disabled={reportData.atrasos.length === 0}
                            >
                                {showChart ? 'Ocultar Gráfica de Atrasos' : 'Mostrar Gráfica de Atrasos'}
                            </button>

                            {showChart && chartData.length > 0 && (
                                <div style={styles.chartContainer}>
                                    <h3>Cantidad de Atrasos por Fecha</h3>
                                    <ResponsiveContainer width="50%" height={300}>
                                        <BarChart
                                            data={chartData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="fecha" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad de Atrasos" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </>
                    ) : (
                        <p>No se encontraron atrasos en este rango de fechas.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f9f9f9',
        marginTop: '20px',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    datePicker: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginTop: '5px',
        width: '180px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    chartButton: {
        padding: '10px 20px',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s ease',
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
    },
    reportContainer: {
        marginTop: '20px',
    },
    tableContainer: {
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 10px', // Separación entre las filas
        fontFamily: '"Roboto", sans-serif',
    },
    th: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        textAlign: 'left',
    },
    td: {
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease',
    },
    tr: {
        cursor: 'pointer',
    },
    trHover: {
        backgroundColor: '#f0f0f0',
    },
    chartContainer: {
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    },
};

export default AttendanceReportCustomRange;