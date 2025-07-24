import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://api.edupuntual.cl';

const COLORS = ['#42a5f5', '#90caf9']; // Justificado, No Justificado

const ReportsPage = () => {
  const [kpis, setKpis] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [justificationData, setJustificationData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedAlumno, setSelectedAlumno] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API_BASE_URL}/api/metrics/daily`, { headers }),
      axios.get(`${API_BASE_URL}/api/metrics/weekly`, { headers }),
      axios.get(`${API_BASE_URL}/api/metrics/monthly-trend`, { headers }),
      axios.get(`${API_BASE_URL}/api/cursos`, { headers })
    ]).then(([d, w, m, c]) => {
      setKpis({
        daily: d.data.count,
        weekly: w.data.reduce((sum, r) => sum + r.count, 0),
        monthly: m.data.reduce((sum, r) => sum + r.count, 0)
      });
      setCursos(c.data.map(curso => curso.nombre_curso));
      toast.success('KPIs cargados correctamente');
    }).catch(() => {
      toast.error('Error cargando KPIs');
    });
  }, []);

  const fetchChartsData = () => {
    if (!selectedReport) return;

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const type = selectedReport.toLowerCase();

    axios.get(`${API_BASE_URL}/api/metrics/${type}/levels`, {
      headers,
      params: { curso: selectedCurso, alumno: selectedAlumno }
    }).then(res => setJustificationData(res.data))
      .catch(() => toast.error('Error cargando justificados'));

    axios.get(`${API_BASE_URL}/api/metrics/${type}/top-students`, {
      headers,
      params: { curso: selectedCurso, alumno: selectedAlumno }
    }).then(res => {
      if (res.data.length === 0) {
        toast.info('No se encontraron registros para el alumno especificado.');
      }
      setTopStudents(res.data);
    }).catch(() => toast.error('Error cargando top estudiantes'));

    axios.get(`${API_BASE_URL}/api/metrics/${type}/top-courses`, {
      headers,
      params: { curso: selectedCurso, alumno: selectedAlumno }
    }).then(res => setTopCourses(res.data))
      .catch(() => toast.error('Error cargando top cursos'));
  };

  useEffect(() => {
    if (selectedReport) {
      fetchChartsData();
      console.log('Justification Data:', justificationData);
    }
  }, [selectedReport, selectedCurso, selectedAlumno]);

  const styles = {
    container: {
      backgroundColor: '#f9fafc',
      fontFamily: 'Poppins, Arial, sans-serif',
      margin: '0 auto',
      padding: '1rem',
      maxWidth: '1300px'
    },
    kpiContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    kpiCard: {
      background: '#fff',
      borderRadius: '0.75rem',
      boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
      flex: '1 1 25%',
      padding: '1rem',
      textAlign: 'center'
    },
    reportCardsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    reportCard: {
      flex: '1 1 20%',
      cursor: 'pointer',
      background: '#fff',
      textAlign: 'center',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease-in-out'
    },
    reportCardActive: {
      border: '2px solid #1976d2',
      background: '#e3f2fd'
    },
    filtersContainer: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: '2rem'
    },
    filterInput: {
      padding: '0.5rem',
      borderRadius: '6px',
      border: '1px solid #ccc',
      minWidth: '200px',
      transition: 'all 0.3s ease-in-out',
      cursor: 'pointer'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    chartContainer: {
      background: '#fff',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '400px'
    },
    studentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      background: '#e3f2fd',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      color: '#1565c0',
      transition: 'background 0.2s ease-in-out',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      cursor: 'default',
      '&:hover': {
        background: '#bbdefb'
      }
    },
    avatar: {
      backgroundColor: '#1976d2',
      color: '#fff',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.75rem',
      fontSize: '16px'
    },
    courseItem: {
      background: '#e3f2fd',
      padding: '0.75rem',
      borderRadius: '6px',
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      color: '#1976d2'
    },
    scrollBox: {
      flex: 1,
      overflowY: 'auto',
      paddingRight: '4px',
    }
  };

  const renderCharts = () => {
    if (!selectedReport) {
      return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Selecciona un tipo de reporte.</p>;
    }

    return (
      <>
        <div style={styles.filtersContainer}>
          <select
            value={selectedCurso}
            onChange={(e) => setSelectedCurso(e.target.value === selectedCurso ? '' : e.target.value)}
            style={styles.filterInput}
          >
            <option value="">Todos los cursos</option>
            {cursos.map(curso => (
              <option key={curso} value={curso}>{curso}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar alumno por nombre"
            value={selectedAlumno}
            onChange={(e) => setSelectedAlumno(e.target.value)}
            style={styles.filterInput}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>    

          <div style={styles.chartContainer}>
            <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>Estudiantes con más atrasos registrados</h4>
            <div style={styles.scrollBox}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {topStudents.map((s, idx) => (
                  <li key={idx} style={styles.studentItem}>
                    <div style={styles.avatar}>
                      {s.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.nombre} — {s.cantidad} atrasos
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>Cursos con más atrasos</h4>
            <div style={styles.scrollBox}> 
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {topCourses.map((c, idx) => (
                <li key={idx} style={styles.courseItem}>
                  📘 {c.curso} — {c.cantidad} atrasos
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
    );
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="bottom-right" />
      <div style={styles.kpiContainer}>
        {[{ label: 'Atrasos Hoy', value: kpis.daily, icon: '📅' },
        { label: 'Atrasos Semana', value: kpis.weekly, icon: '🗓️' },
        { label: 'Atrasos Mes', value: kpis.monthly, icon: '📈' }].map(({ label, value, icon }) => (
          <div key={label} style={styles.kpiCard}>
            <div style={{ fontSize: 36, marginBottom: '0.5rem' }}>{icon}</div>
            <h4 style={{ marginBottom: '0.25rem', color: '#1976d2' }}>{label}</h4>
            <p style={{ fontSize: 28, fontWeight: 'bold' }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={styles.reportCardsContainer}>
        {['Diario', 'Semanal', 'Mensual', 'Anual'].map(tipo => (
          <div
            key={tipo}
            onClick={() => setSelectedReport(tipo)}
            style={{
              ...styles.reportCard,
              ...(selectedReport === tipo ? styles.reportCardActive : {})
            }}
          >
            <h4>{tipo}</h4>
          </div>
        ))}
      </div>

      {renderCharts()}
    </div>
  );
};

export default ReportsPage;
