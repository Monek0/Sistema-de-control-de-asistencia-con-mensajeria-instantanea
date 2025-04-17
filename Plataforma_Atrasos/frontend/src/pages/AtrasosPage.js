import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PDFDocument, rgb } from 'pdf-lib';

const AtrasosPage = () => {

    const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://18.217.59.7:443';


    const [atrasos, setAtrasos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [searchRut, setSearchRut] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchCurso, setSearchCurso] = useState('');
    const [searchMonth, setSearchMonth] = useState('');

    useEffect(() => {
        const fetchAtrasos = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/atrasos`);
                setAtrasos(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener la lista de atrasos:', error);
                setError('Error al obtener la lista de atrasos');
                setLoading(false);
            }
        };

        fetchAtrasos();
    }, [API_BASE_URL]);

    const filteredAtrasos = atrasos.filter((atraso) => {
        const rut = atraso.rut_alumno || '';
        const nombre = atraso.nombre_completo || '';
        const curso = atraso.nombre_curso || '';

        const matchesRut = rut.toLowerCase().includes(searchRut.toLowerCase());
        const matchesName = nombre.toLowerCase().includes(searchName.toLowerCase());
        const matchesCurso = curso.toLowerCase().includes(searchCurso.toLowerCase());

        const fechaAtraso = new Date(atraso.fecha_atrasos);
        const matchesMonth = searchMonth ? fechaAtraso.getMonth() === parseInt(searchMonth) : true;

        return matchesRut && matchesName && matchesCurso && matchesMonth;
    });

    const generatePDF = async () => {
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595, 842]);
        const { height } = page.getSize();
        const fontSize = 10;
        const titleFontSize = 12;
        const headerFontSize = 10;

        page.drawText('Reporte de Atrasos', {
            x: 240,
            y: height - 40,
            size: titleFontSize,
            color: rgb(0, 0, 1),
        });

        let yPosition = height - 60;
        page.drawText('RUT Alumno', { x: 30, y: yPosition, size: headerFontSize });
        page.drawText('Fecha Atraso', { x: 100, y: yPosition, size: headerFontSize });
        page.drawText('Hora Atraso', { x: 170, y: yPosition, size: headerFontSize });
        page.drawText('Justificativo', { x: 240, y: yPosition, size: headerFontSize });
        page.drawText('Nombre Completo', { x: 300, y: yPosition, size: headerFontSize });
        page.drawText('Curso', { x: 520, y: yPosition, size: headerFontSize });

        yPosition -= 20;
        const rowHeight = 20;

        filteredAtrasos.forEach((atraso) => {
            if (yPosition < 60) {
                page.drawText('Firma Apoderado ________________', {
                    x: 30,
                    y: 40,
                    size: fontSize,
                });
                page = pdfDoc.addPage([595, 842]);
                yPosition = height - 40;
            }

            const fecha = new Date(atraso.fecha_atrasos);
            const fechaFormateada = fecha.toLocaleDateString();
            const horaFormateada = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const justificado = atraso.justificativo
                ? `Sí (${atraso.tipo_justificativo})`
                : 'No';

            page.drawText(atraso.rut_alumno || '', { x: 30, y: yPosition, size: fontSize });
            page.drawText(fechaFormateada, { x: 100, y: yPosition, size: fontSize });
            page.drawText(horaFormateada, { x: 170, y: yPosition, size: fontSize });
            page.drawText(justificado, { x: 240, y: yPosition, size: fontSize });
            page.drawText(atraso.nombre_completo || '', { x: 300, y: yPosition, size: fontSize });
            page.drawText(atraso.nombre_curso || '', { x: 520, y: yPosition, size: fontSize });

            yPosition -= rowHeight;
        });

        page.drawText('Firma Apoderado ________________', {
            x: 30,
            y: 40,
            size: fontSize,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'reporte_atrasos.pdf';
        link.click();
    };

    if (loading) return <div style={styles.loading}>Cargando lista de atrasos...</div>;
    if (error) return <div style={styles.error}>{error}</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Listado de Atrasos</h1>

            <div style={styles.filters}>
                <input type="text" placeholder="Buscar por RUT" value={searchRut} onChange={(e) => setSearchRut(e.target.value)} style={styles.filterInput} />
                <input type="text" placeholder="Buscar por Nombre" value={searchName} onChange={(e) => setSearchName(e.target.value)} style={styles.filterInput} />
                <input type="text" placeholder="Buscar por Curso" value={searchCurso} onChange={(e) => setSearchCurso(e.target.value)} style={styles.filterInput} />
                <select value={searchMonth} onChange={(e) => setSearchMonth(e.target.value)} style={styles.filterInput}>
                    <option value="">Seleccionar Mes</option>
                    {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((mes, idx) => (
                        <option key={idx} value={idx}>{mes}</option>
                    ))}
                </select>
                <button onClick={generatePDF} style={styles.pdfButton}>Imprimir Reporte PDF</button>
            </div>

            {filteredAtrasos.length === 0 ? (
                <p style={styles.noData}>No hay atrasos registrados.</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.headerCell}>RUT</th>
                                <th style={styles.headerCell}>Fecha</th>
                                <th style={styles.headerCell}>Hora</th>
                                <th style={styles.headerCell}>Justificativo</th>
                                <th style={styles.headerCell}>Nombre</th>
                                <th style={styles.headerCell}>Curso</th>
                                <th style={styles.headerCell}>PDF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAtrasos.map((atraso) => {
                                const fecha = new Date(atraso.fecha_atrasos);
                                const fechaFormateada = fecha.toLocaleDateString();
                                const horaFormateada = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                const justificado = atraso.justificativo
                                    ? `Sí (${atraso.tipo_justificativo})`
                                    : 'No';

                                return (
                                    <tr key={atraso.cod_atrasos} style={styles.row}>
                                        <td style={styles.cell}>{atraso.rut_alumno}</td>
                                        <td style={styles.cell}>{fechaFormateada}</td>
                                        <td style={styles.cell}>{horaFormateada}</td>
                                        <td style={styles.cell}>{justificado}</td>
                                        <td style={styles.cell}>{atraso.nombre_completo}</td>
                                        <td style={styles.cell}>{atraso.nombre_curso}</td>
                                        <td style={styles.cell}>
                                            {atraso.pdf_path ? (
                                                <a
                                                    href={`${API_BASE_URL}/SalidaPDF/${atraso.pdf_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={styles.pdfLink}
                                                    download
                                                >
                                                    📥 Descargar PDF
                                                </a>
                                            ) : 'No disponible'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '1.5rem',
        backgroundColor: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    title: {
        textAlign: 'center',
        color: 'black',
        marginBottom: '1rem',
    },
    filters: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
    },
    filterInput: {
        padding: '0.5rem',
        fontSize: '1rem',
        borderRadius: '0.375rem',
        border: '1px solid #ccc',
    },
    pdfButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#01579b',
        color: '#fff',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    headerCell: {
        backgroundColor: '#01579b',
        color: '#fff',
        padding: '0.75rem',
        borderBottom: '2px solid #01579b',
    },
    row: {
        backgroundColor: '#f7f9f9',
    },
    cell: {
        padding: '0.75rem',
        borderBottom: '1px solid #ddd',
    },
    noData: {
        textAlign: 'center',
        marginTop: '1rem',
        color: '#888',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: '1rem',
    },
    loading: {
        textAlign: 'center',
        marginTop: '2rem',
    },
    pdfLink: {
        color: '#01579b',
        textDecoration: 'none',
    },
};

export default AtrasosPage;
