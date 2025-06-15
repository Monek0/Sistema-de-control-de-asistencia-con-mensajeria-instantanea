// src/pages/ReportsPage.js

import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AttendanceReport from '../components/AttendanceReport';
import AttendanceReportCustomRange from '../components/AttendanceReportCustomRange';

Modal.setAppElement('#root');

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://api.edupuntual.cl';

const COLORS = ['#4caf50', '#f44336'];

const ReportsPage = () => {
  const [kpis, setKpis] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [justifiedVsNot, setJustifiedVsNot] = useState([]);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API_BASE_URL}/api/metrics/daily`, { headers }),
      axios.get(`${API_BASE_URL}/api/metrics/weekly`, { headers }),
      axios.get(`${API_BASE_URL}/api/metrics/monthly-trend`, { headers }),
      axios.get(`${API_BASE_URL}/api/metrics/top-users`, { headers }),
      axios.get(`${API_BASE_URL}/api/metrics/justified-vs-not`, { headers })
    ]).then(([d, w, m, t, j]) => {
      setKpis({
        daily: d.data.count,
        weekly: w.data.reduce((sum, r) => sum + r.count, 0),
        monthly: m.data.reduce((sum, r) => sum + r.count, 0)
      });
      setMonthlyTrend(m.data.map(r => ({ name: r.day, value: r.count })));
      setTopUsers(t.data.map(r => ({
        name: r.nombre_alumno || r.rut_alumno,
        value: r.count
      })));
      setJustifiedVsNot([
        { name: 'Justificados', value: j.data.justified },
        { name: 'No Justificados', value: j.data.not }
      ]);
      toast.success('Datos cargados correctamente');
    }).catch(error => {
      console.error(error);
      toast.error('Error cargando datos');
    });
  }, []);

  const styles = {
    button: {
      backgroundColor: 'rgb(1, 87, 155)',
      border: 'none',
      borderRadius: '0.3125rem',
      color: '#fff',
      cursor: 'pointer',
      margin: '0.3125rem',
      padding: '0.625rem 1.25rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
    },
    buttonHover: {
      backgroundColor: 'rgb(1, 67, 135)',
      transform: 'translateY(-0.0625rem)',
    },
    chartBox: {
      background: '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
      padding: '1rem'
    },
    container: {
      backgroundColor: '#f0f2f5',
      fontFamily: 'Poppins, Arial, sans-serif',
      margin: '0 auto',
      paddingInline: '1rem',
      paddingTop: '1rem',
      paddingBottom: '1rem'
    },
    description: {
      color: '#666',
      fontSize: '0.875rem',
      marginTop: '0.3125rem'
    },
    kpiCard: {
      background: '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
      cursor: 'pointer',
      flex: '1 1 25%',
      padding: '1rem',
      textAlign: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    kpiCardHover: {
      boxShadow: '0 0.25rem 0.75rem rgba(0,0,0,0.15)',
      transform: 'scale(1.02)'
    },
    kpiContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.25rem'
    },
    listContainer: {
      background: '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
      padding: '1rem'
    },
    listItem: {
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.5rem'
    },
    section: {
      marginBottom: '2.5rem'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.625rem'
    },
    buttonsContainer: {
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      marginTop: '2rem'
    }
  };
  

  return (
    <div style={styles.container}>
      <ToastContainer position="bottom-right" />

      {/* KPIs */}
      <div style={styles.kpiContainer}>
        {[{ label: 'Atrasos Hoy', value: kpis.daily, icon: '📅' },
          { label: 'Atrasos Semana', value: kpis.weekly, icon: '🗓️' },
          { label: 'Atrasos Mes', value: kpis.monthly, icon: '📈' }
        ].map(({ label, value, icon }) => (
          <div key={label} style={styles.kpiCard}>
            <div style={{ fontSize: 32 }}>{icon}</div>
            <h4>{label}</h4>
            <p style={{ fontSize: 24 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tendencia Mensual */}
      <div style={styles.section}>
        <div style={styles.chartBox}>
          <h3 style={styles.title}>Tendencia Mensual de Atrasos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend} aria-label="Tendencia mensual de atrasos">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="rgb(1, 87, 155)" />
            </LineChart>
          </ResponsiveContainer>
          <p style={styles.description}>
            Este gráfico muestra la cantidad de atrasos registrados día por día en el mes actual.
          </p>
        </div>
      </div>

      {/* Sección de Distribución y Top 5 en línea */}
      <div style={{ ...styles.section, display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Gráfico de Pie */}
        <div style={{ ...styles.chartBox, flex: 1, minWidth: '18.75rem' }}>
          <h3 style={styles.title}>Distribución de Atrasos Justificados y No Justificados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={justifiedVsNot}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                label
              >
                {justifiedVsNot.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p style={styles.description}>
            Este gráfico muestra la proporción de atrasos que fueron justificados frente a los que no lo fueron.
          </p>
        </div>

        {/* Lista de Top 5 */}
        <div style={{ ...styles.listContainer, flex: 1, minWidth: '18.75rem' }}>
          <h3 style={styles.title}>Top 5 Estudiantes con Más Atrasos</h3>
          {topUsers.length > 0 ? (
            topUsers.map((user, idx) => {
              const color = user.value > 5 ? '#f44336' : user.value > 2 ? '#ff9800' : '#4caf50';
              return (
                <div key={idx} style={{ ...styles.listItem }}>
                  <span>{idx + 1}. {user.name}</span>
                  <span style={{ color }}>{user.value} atrasos</span>
                </div>
              );
            })
          ) : (
            <p>No hay registros suficientes.</p>
          )}
        </div>
      </div>

      {/* Botones Reportes */}
      <div style={styles.buttonsContainer}>
        <button 
          style={styles.button} 
          onClick={() => setShowDailyModal(true)}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgb(1, 67, 135)';
            e.target.style.transform = 'translateY(-0.0625rem)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgb(1, 87, 155)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Ver Reporte Diario
        </button>
        <button 
          style={styles.button} 
          onClick={() => setShowWeeklyModal(true)}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgb(1, 67, 135)';
            e.target.style.transform = 'translateY(-0.0625rem)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgb(1, 87, 155)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Ver Reporte Semanal
        </button>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showDailyModal} 
        onRequestClose={() => setShowDailyModal(false)} 
        style={{ 
          content: { 
            top: '10%', 
            maxWidth: '43.75rem', 
            margin: 'auto',
            borderRadius: '0.5rem',
            border: 'none',
            boxShadow: '0 0.25rem 1rem rgba(0,0,0,0.15)'
          } 
        }}
      >
        <AttendanceReport />
      </Modal>

      <Modal 
        isOpen={showWeeklyModal} 
        onRequestClose={() => setShowWeeklyModal(false)} 
        style={{ 
          content: { 
            top: '10%', 
            maxWidth: '43.75rem', 
            margin: 'auto',
            borderRadius: '0.5rem',
            border: 'none',
            boxShadow: '0 0.25rem 1rem rgba(0,0,0,0.15)'
          } 
        }}
      >
        <AttendanceReportCustomRange />
      </Modal>
    </div>
  );
};

export default ReportsPage;