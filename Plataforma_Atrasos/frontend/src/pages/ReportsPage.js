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
    container: { padding: 20, fontFamily: 'Poppins, Arial, sans-serif', backgroundColor: '#f0f2f5' },
    kpiContainer: { display: 'flex', gap: 20, marginBottom: 40, flexWrap: 'wrap' },
    kpiCard: {
      flex: '1 1 30%',
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: 20,
      textAlign: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    },
    kpiCardHover: {
      transform: 'scale(1.02)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    section: { marginBottom: 40 },
    title: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: 10 },
    chartBox: {
      background: '#fff',
      borderRadius: 8,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    description: { fontSize: 14, color: '#666', marginTop: 5 },
    listContainer: {
      background: '#fff',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    listItem: { padding: 8, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' },
    button: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: 5,
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      margin: '5px'
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
              <Line type="monotone" dataKey="value" stroke="#01579b" />
            </LineChart>
          </ResponsiveContainer>
          <p style={styles.description}>
            Este gráfico muestra la cantidad de atrasos registrados día por día en el mes actual.
          </p>
        </div>
      </div>

      {/* Justificados vs No Justificados */}
      <div style={styles.section}>
        <div style={styles.chartBox}>
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
      </div>

      {/* Top 5 Estudiantes */}
      <div style={styles.section}>
        <div style={styles.listContainer}>
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
      <div style={{ textAlign: 'center' }}>
        <button style={styles.button} onClick={() => setShowDailyModal(true)}>
          Ver Reporte Diario
        </button>
        <button style={styles.button} onClick={() => setShowWeeklyModal(true)}>
          Ver Reporte Semanal
        </button>
      </div>

      {/* Modals */}
      <Modal isOpen={showDailyModal} onRequestClose={() => setShowDailyModal(false)} style={{ content: { top: '10%', maxWidth: '700px', margin: 'auto' } }}>
        <AttendanceReport />
      </Modal>

      <Modal isOpen={showWeeklyModal} onRequestClose={() => setShowWeeklyModal(false)} style={{ content: { top: '10%', maxWidth: '700px', margin: 'auto' } }}>
        <AttendanceReportCustomRange />
      </Modal>
    </div>
  );
};

export default ReportsPage;
