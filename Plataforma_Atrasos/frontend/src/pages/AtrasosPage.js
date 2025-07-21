import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { PDFDocument, rgb } from 'pdf-lib';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, CircularProgress, Typography } from '@mui/material';

const AtrasosPage = () => {
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://api.edupuntual.cl';

  const [atrasos, setAtrasos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAtraso, setUpdatingAtraso] = useState(null); // Para mostrar loading en botones individuales

  const [searchRut, setSearchRut] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCurso, setSearchCurso] = useState('');
  const [searchMonth, setSearchMonth] = useState('');

  // Estados para paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // Función para actualizar el estado de justificación
  const updateJustificacion = async (codAtrasos, currentStatus) => {
    setUpdatingAtraso(codAtrasos);
    try {
      await axios.put(`${API_BASE_URL}/api/atrasos/${codAtrasos}`, {
        justificado: !currentStatus
      });

      // Actualizar el estado local
      setAtrasos(prevAtrasos =>
        prevAtrasos.map(atraso =>
          atraso.cod_atrasos === codAtrasos
            ? { ...atraso, justificado: !currentStatus }
            : atraso
        )
      );
    } catch (error) {
      console.error('Error al actualizar justificación:', error);
      setError('Error al actualizar la justificación');
    } finally {
      setUpdatingAtraso(null);
    }
  };

  // Filtrado de atrasos según los filtros
  const filteredAtrasos = useMemo(() => {
    return atrasos.filter((atraso) => {
      const rut = atraso.rut_alumno || '';
      const nombre = atraso.nombre_completo || '';
      const curso = atraso.nombre_curso || '';

      const matchesRut = rut.toLowerCase().includes(searchRut.toLowerCase());
      const matchesName = nombre.toLowerCase().includes(searchName.toLowerCase());
      const matchesCurso = curso.toLowerCase().includes(searchCurso.toLowerCase());

      if (searchMonth !== '') {
        const fechaAtraso = new Date(atraso.fecha_atrasos);
        if (fechaAtraso.getMonth() !== parseInt(searchMonth)) return false;
      }

      return matchesRut && matchesName && matchesCurso;
    });
  }, [atrasos, searchRut, searchName, searchCurso, searchMonth]);

  // Datos paginados
  const paginatedAtrasos = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAtrasos.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAtrasos, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredAtrasos.length / rowsPerPage);

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
    const rowHeight = 20;

    page.drawText('RUT Alumno', { x: 30, y: yPosition, size: headerFontSize });
    page.drawText('Fecha Atraso', { x: 100, y: yPosition, size: headerFontSize });
    page.drawText('Hora Atraso', { x: 170, y: yPosition, size: headerFontSize });
    page.drawText('Justificado', { x: 240, y: yPosition, size: headerFontSize });
    page.drawText('Nombre Completo', { x: 300, y: yPosition, size: headerFontSize });
    page.drawText('Curso', { x: 520, y: yPosition, size: headerFontSize });

    yPosition -= 20;

    filteredAtrasos.forEach((atraso) => {
      if (yPosition < 60) {
        page.drawText('Firma ________________', { x: 30, y: 40, size: fontSize });
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - 40;
      }

      const fecha = new Date(atraso.fecha_atrasos);
      const fechaFormateada = fecha.toLocaleDateString();
      const horaFormateada = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const justificado = atraso.justificado ? 'Sí' : 'No';

      page.drawText(atraso.rut_alumno || '', { x: 30, y: yPosition, size: fontSize });
      page.drawText(fechaFormateada, { x: 100, y: yPosition, size: fontSize });
      page.drawText(horaFormateada, { x: 170, y: yPosition, size: fontSize });
      page.drawText(justificado, { x: 240, y: yPosition, size: fontSize });
      page.drawText(atraso.nombre_completo || '', { x: 300, y: yPosition, size: fontSize });
      page.drawText(atraso.nombre_curso || '', { x: 520, y: yPosition, size: fontSize });

      yPosition -= rowHeight;
    });

    page.drawText('Firma ________________', { x: 30, y: 40, size: fontSize });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reporte_atrasos.pdf';
    link.click();
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '2rem auto',
      padding: '1.5rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    title: {
      textAlign: 'center',
      fontSize: '1.8rem',
      color: '#01579b',
      marginBottom: '1.5rem',
    },
    filters: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem',
      justifyContent: 'center',
    },
    filterInput: {
      padding: '0.6rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #ccc',
      minWidth: '200px',
    },
    pdfButton: {
      padding: '0.6rem 1.2rem',
      backgroundColor: '#01579b',
      color: '#fff',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
    },
    headerCell: {
      backgroundColor: '#01579b',
      color: '#fff',
      padding: '0.75rem',
      borderBottom: '2px solid #01579b',
      cursor: 'pointer',
    },
    cell: {
      padding: '0.75rem',
      borderBottom: '1px solid #ddd',
      textAlign: 'center',
    },
    justificarButton: {
      padding: '0.4rem 0.8rem',
      border: 'none',
      borderRadius: '0.3rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.85rem',
      minWidth: '80px',
    },
    justificarButtonSi: {
      backgroundColor: '#4caf50',
      color: 'white',
    },
    justificarButtonNo: {
      backgroundColor: '#f44336',
      color: 'white',
    },
    justificarButtonLoading: {
      backgroundColor: '#ccc',
      color: '#666',
      cursor: 'not-allowed',
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
    noData: {
      textAlign: 'center',
      marginTop: '1rem',
      color: '#888',
    },
    paginationContainer: {
      marginTop: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paginationControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    paginationButton: {
      padding: '0.3rem 0.8rem',
      border: '1px solid #01579b',
      backgroundColor: 'white',
      color: '#01579b',
      cursor: 'pointer',
      borderRadius: '0.3rem',
      fontWeight: 'bold',
      userSelect: 'none',
    },
    paginationButtonDisabled: {
      opacity: 0.5,
      cursor: 'default',
    },
    paginationSelect: {
      padding: '0.4rem',
      borderRadius: '0.3rem',
      border: '1px solid #ccc',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Listado de Atrasos</h1>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por RUT"
          value={searchRut}
          onChange={(e) => setSearchRut(e.target.value)}
          style={styles.filterInput}
        />
        <input
          type="text"
          placeholder="Buscar por Nombre"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={styles.filterInput}
        />
        <input
          type="text"
          placeholder="Buscar por Curso"
          value={searchCurso}
          onChange={(e) => setSearchCurso(e.target.value)}
          style={styles.filterInput}
        />
        <select
          value={searchMonth}
          onChange={(e) => setSearchMonth(e.target.value)}
          style={styles.filterInput}
        >
          <option value="">Seleccionar Mes</option>
          {[
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ].map((mes, idx) => (
            <option key={idx} value={idx}>{mes}</option>
          ))}
        </select>
        <button onClick={generatePDF} style={styles.pdfButton}>📄 Imprimir Reporte</button>
      </div>

      {loading && <div style={styles.loading}>Cargando lista de atrasos...</div>}
      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && (
        filteredAtrasos.length === 0 ? (
          <p style={styles.noData}>No hay atrasos registrados.</p>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.headerCell}>RUT</th>
                  <th style={styles.headerCell}>Fecha</th>
                  <th style={styles.headerCell}>Hora</th>
                  <th style={styles.headerCell}>Justificado</th>
                  <th style={styles.headerCell}>Nombre Completo</th>
                  <th style={styles.headerCell}>Curso</th>
                  <th style={styles.headerCell}>PDF</th>
                  <th style={styles.headerCell}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAtrasos.map(atraso => {
                  const fecha = new Date(atraso.fecha_atrasos);
                  const fechaStr = fecha.toLocaleDateString();
                  const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const justificado = atraso.justificado;
                  const isUpdating = updatingAtraso === atraso.cod_atrasos;

                  return (
                    <tr key={`${atraso.cod_atrasos}-${atraso.rut_alumno}-${atraso.fecha_atrasos}`}>
                      <td style={styles.cell}>{atraso.rut_alumno}</td>
                      <td style={styles.cell}>{fechaStr}</td>
                      <td style={styles.cell}>{horaStr}</td>
                      <td style={styles.cell}>
                        <span style={{
                          color: justificado ? '#4caf50' : '#f44336',
                          fontWeight: 'bold'
                        }}>
                          {justificado ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td style={{ ...styles.cell, textAlign: 'left' }}>{atraso.nombre_completo}</td>
                      <td style={styles.cell}>{atraso.nombre_curso}</td>
                      <td style={styles.cell}>
                        {atraso.pdf_path ? (
                          <a
                            href={`${API_BASE_URL}/SalidaPDF/${atraso.pdf_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            style={styles.pdfLink}
                          >
                            📥 Descargar
                          </a>
                        ) : (
                          'No disponible'
                        )}
                      </td>
                      <td style={styles.cell}>
                        <button
                          onClick={() => updateJustificacion(atraso.cod_atrasos, justificado)}
                          disabled={isUpdating}
                          style={{
                            ...styles.justificarButton,
                            ...(isUpdating
                              ? styles.justificarButtonLoading
                              : justificado
                              ? styles.justificarButtonNo
                              : styles.justificarButtonSi
                            )
                          }}
                        >
                          {isUpdating
                            ? '⏳'
                            : justificado
                            ? '❌ Injustificar'
                            : '✅ Justificar'
                          }
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={styles.paginationContainer}>
              <div>
                Página {page} de {totalPages}
              </div>
              <div style={styles.paginationControls}>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setPage(1);
                  }}
                  style={styles.paginationSelect}
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  style={{
                    ...styles.paginationButton,
                    ...(page === 1 ? styles.paginationButtonDisabled : {})
                  }}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  style={{
                    ...styles.paginationButton,
                    ...(page === totalPages ? styles.paginationButtonDisabled : {})
                  }}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default AtrasosPage;