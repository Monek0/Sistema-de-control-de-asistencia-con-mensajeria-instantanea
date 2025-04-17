import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, LabelList
} from 'recharts';
import AttendanceReport from '../components/AttendanceReport';
import AttendanceReportCustomRange from '../components/AttendanceReportCustomRange';

Modal.setAppElement('#root');

// ✅ URL dinámica
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://18.217.59.7:443';

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
      setTopUsers(t.data.map(r => ({ name: r.rut_alumno, value: r.count })));
      setJustifiedVsNot([
        { name: 'Justificados', value: j.data.justified },
        { name: 'No Justificados', value: j.data.not }
      ]);
    }).catch(console.error);
  }, []);


  const styles = {
    kpiContainer: { display: 'flex', gap: 20, marginBottom: 40 },
    kpiCard: {
      flex: 1,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: 20,
      textAlign: 'center'
    },
    kpiIcon: { fontSize: 32, marginBottom: 10, color: '#01579b' },
    chartContainer: { display: 'flex', gap: 40, marginBottom: 40 },
    chartBox: {
      flex: 1,
      background: '#fff',
      borderRadius: 8,
      padding: 20,
      height: 300
    },
    controls: { display: 'flex', gap: 10, marginBottom: 20 },
    button: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: 5,
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    modalContent: {
        position: 'relative',
        top: '15%',
        bottom: '15%',
        maxWidth: '900px',
        width: '90%',
        margin: 'auto',
        borderRadius: 8,
        padding: 20,
        maxHeight: '70vh',
        overflowY: 'auto'
      },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      background: 'transparent',
      border: 'none',
      fontSize: 24,
      cursor: 'pointer'
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      {/* KPI Cards */}
      <div style={styles.kpiContainer}>
        {[
          { label: 'Atrasos Hoy', value: kpis.daily, icon: '📅' },
          { label: 'Atrasos Semana', value: kpis.weekly, icon: '🗓️' },
          { label: 'Atrasos Mes', value: kpis.monthly, icon: '📈' }
        ].map(({ label, value, icon }) => (
          <div key={label} style={styles.kpiCard}>
            <div style={styles.kpiIcon}>{icon}</div>
            <h4>{label}</h4>
            <p style={{ fontSize: 24, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={styles.chartContainer}>
        <div style={styles.chartBox}>
          <h4>Tendencia mensual</h4>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#01579b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartBox}>
          <h4>Top 5 usuarios</h4>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={topUsers}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0288d1">
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartBox}>
          <h4>Justificados vs No Justificados</h4>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={justifiedVsNot}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                fill="#82ca9d"
                label
              >
                {justifiedVsNot.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button style={styles.button} onClick={() => setShowDailyModal(true)}>
          Mostrar Reporte Diario
        </button>
        <button style={styles.button} onClick={() => setShowWeeklyModal(true)}>
          Mostrar Reporte Semanal
        </button>
      </div>

      {/* Daily Modal */}
      <Modal
        isOpen={showDailyModal}
        onRequestClose={() => setShowDailyModal(false)}
        style={{ content: styles.modalContent, overlay: { backgroundColor: 'rgba(0,0,0,0.5)' } }}
      >
        <button style={styles.closeButton} onClick={() => setShowDailyModal(false)}>
          &times;
        </button>
        <AttendanceReport />
      </Modal>

      {/* Weekly Modal */}
      <Modal
        isOpen={showWeeklyModal}
        onRequestClose={() => setShowWeeklyModal(false)}
        style={{ content: styles.modalContent, overlay: { backgroundColor: 'rgba(0,0,0,0.5)' } }}
      >
        <button style={styles.closeButton} onClick={() => setShowWeeklyModal(false)}>
          &times;
        </button>
        <AttendanceReportCustomRange />
      </Modal>
    </div>
  );
};

export default ReportsPage;
