import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import axios from 'axios';

import controlIcon from '../assets/icons/control.png';
import reportIcon from '../assets/icons/report.png';
import messageIcon from '../assets/icons/message.png';
import agregarIcon from '../assets/icons/agregar-usuario.png';
import AttendancePage from './AttendancePage';
import ReportsPage from './ReportsPage';
import AtrasosPage from './AtrasosPage';
import RegisterPage from './RegisterPage';
import logo from '../assets/images/logo.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeMenu, setActiveMenu] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const rutUsername = localStorage.getItem('rut_username');
        const response = await axios.get(
          `http://localhost:3000/auth/username/${rutUsername}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserName(response.data?.nombre_usuario || 'No te encontré');
      } catch (error) {
        console.error('Error al obtener el nombre de usuario:', error);
        setUserName('No te encontré');
      }
    };
    fetchUserName();
  }, []);

  const handleMenuClick = (action) => {
    setActiveMenu(action);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const styles = {
    pageContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f7f9f9',
      position: 'relative',
      fontFamily: 'sans-serif',
    },
    hamburgerButton: {
      position: 'fixed',
      top: '1rem',
      left: '1rem',
      zIndex: 50,
      padding: '0.5rem',
      backgroundColor: '#01579b',
      border: 'none',
      borderRadius: '0.375rem',
      color: 'white',
      cursor: 'pointer',
      display: isMobile ? 'block' : 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 30,
      display: isMobile && isSidebarOpen ? 'block' : 'none',
    },
    sidebar: {
      position: isMobile ? 'fixed' : 'sticky',
      top: 0,
      left: 0,
      height: '100vh',
      width: '220px',
      backgroundColor: '#01579b',
      color: 'white',
      zIndex: 40,
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
    },
    sidebarContent: {
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem',
      marginBottom: '0.5rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.3s',
    },
    icon: {
      width: '24px',
      height: '24px',
      marginRight: '0.75rem',
    },
    logo: {
      width: '90%',
      marginTop: 'auto',
      marginBottom: '1rem',
      alignSelf: 'center',
    },
    topbar: {
      backgroundColor: '#fff',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    },
    topbarContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingLeft: isMobile ? '3rem' : '1rem',
      paddingRight: '1rem',
    },
    logoutButton: {
      backgroundColor: '#e74c3c',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.3s',
    },
    contentArea: {
      padding: '1.5rem',
      flex: 1,
      width: '100%',
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minHeight: '100vh',
    },
  };

  const MenuItem = ({ icon, text, action }) => {
    const isActive = activeMenu === action;
    return (
      <div
        style={{
          ...styles.menuItem,
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        }}
        onClick={() => handleMenuClick(action)}
        className="hover:bg-blue-800 transition transform hover:scale-105"
      >
        <img src={icon} alt={text} style={styles.icon} />
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div style={styles.pageContainer}>
      <button
        style={styles.hamburgerButton}
        className="transition transform hover:scale-105"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div style={styles.overlay} onClick={() => setIsSidebarOpen(false)} />

      <div style={styles.sidebar}>
        <div style={styles.sidebarContent}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Menú</h3>
          <MenuItem icon={controlIcon} text="Control de atrasos" action="attendance" />
          <MenuItem icon={reportIcon} text="Reportes" action="reports" />
          <MenuItem icon={messageIcon} text="Mensajería" action="atrasos" />
          <MenuItem icon={agregarIcon} text="Registrar Usuario" action="registro" />
          <img src={logo} alt="Logo" style={styles.logo} />
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.topbar}>
          <div style={styles.topbarContent}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              Sistema de Control de Atrasos
            </h2>
            <button
              style={styles.logoutButton}
              className="hover:bg-red-600 transition transform hover:scale-105"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div style={styles.contentArea}>
          {activeMenu === 'home' && (
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4">Bienvenido, {userName}!</h3>
            </div>
          )}
          {activeMenu === 'attendance' && <AttendancePage />}
          {activeMenu === 'reports' && <ReportsPage />}
          {activeMenu === 'atrasos' && <AtrasosPage />}
          {activeMenu === 'registro' && <RegisterPage />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
