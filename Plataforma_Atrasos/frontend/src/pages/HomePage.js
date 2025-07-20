import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

import controlIcon from '../assets/icons/control.png';
import reportIcon from '../assets/icons/report.png';
import messageIcon from '../assets/icons/message.png';
import agregarIcon from '../assets/icons/agregar-usuario.png';
import studentIcon from '../assets/icons/estudiante.png';
import AttendancePage from './AttendancePage';
import ReportsPage from './ReportsPage';
import AtrasosPage from './AtrasosPage';
import RegisterPage from './RegisterPage';
import EstudiantesPage from './EstudiantesPage';
import logo from '../assets/images/logo.png';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://api.edupuntual.cl';

const HomePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeMenu, setActiveMenu] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userRole, setUserRole] = useState(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsSidebarOpen(true);
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
        const response = await axios.get(`${API_BASE_URL}/auth/username/${rutUsername}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(response.data?.nombre_usuario || 'No te encontré');
      } catch (error) {
        console.error('Error al obtener nombre de usuario:', error);
        setUserName('No te encontré');
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || decoded.cod_rol);
      } catch (err) {
        console.error('Error decodificando token:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchWhatsappStatus = async () => {
      try {
        const socket = require('socket.io-client')(API_BASE_URL, { transports: ['websocket'] });
        socket.emit('get_status');
        socket.on('authenticated', () => setWhatsappConnected(true));
        socket.on('disconnected', () => setWhatsappConnected(false));
      } catch (error) {
        console.error('Error preguntando estado inicial de WhatsApp:', error);
        setWhatsappConnected(false);
      }
    };

    fetchWhatsappStatus();
  }, []);

  const handleMenuClick = (action) => {
    setActiveMenu(action);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      navigate('/login');
    }, 2000);
  };

  const styles = {
    pageContainer: {
      display: 'flex', 
      height: '100vh', 
      overflow: 'hidden', 
      background: 'linear-gradient(135deg, #e0f7fa, #f7f9f9)', 
      fontFamily: 'Poppins, sans-serif'
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
      display: isMobile ? 'block' : 'none'
    },
    overlay: {
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
      zIndex: 30, 
      display: isMobile && isSidebarOpen ? 'block' : 'none'
    },
    sidebar: {
      position: isMobile ? 'fixed' : 'sticky', 
      top: 0, 
      left: 0, 
      height: '100vh', 
      width: '13.75rem', 
      backgroundColor: '#01579b', 
      color: 'white', zIndex: 40, 
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', 
      transition: 'transform 0.3s ease-in-out', 
      display: 'flex', 
      flexDirection: 'column', 
      flexShrink: 0
    },
    sidebarContent: {
      padding: '1.5rem', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      overflowY: 'auto'
    },
    separator: { 
      height: '1px', 
      background: 'white', 
      margin: '1rem 0', 
      opacity: 0.3 
    },
    menuItem: {
      display: 'flex', 
      alignItems: 'center', 
      padding: '0.75rem', 
      marginBottom: '0.5rem', 
      borderRadius: '0.375rem', 
      cursor: 'pointer', 
      transition: 'background-color 0.2s, transform 0.3s'
    },
    icon: { 
      width: '1.5rem', 
      height: '1.5rem', 
      marginRight: '0.75rem' 
    },
    logo: { 
      width: '90%', 
      marginTop: 'auto', 
      marginBottom: '1rem', 
      alignSelf: 'center' 
    },
    whatsappStatus: {
      marginTop: '0.625rem', 
      padding: '0.5rem', 
      borderRadius: '0.5rem', 
      backgroundColor: whatsappConnected ? '#d4edda' : '#f8d7da', 
      color: whatsappConnected ? '#155724' : '#721c24', textAlign: 'center', 
      fontSize: '0.8rem', 
      fontWeight: 'bold'
    },
    topbar: {
      padding: '1rem', 
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
      backgroundColor: '#01579b', 
      color: '#fff'
    },
    topbarContent: { 
      display: 'flex', 
      justifyContent: 'flex-end', 
      alignItems: 'center', 
      width: '100%' 
    },
    contentArea: { 
      padding: '0rem', 
      flex: 1, 
      width: '100%', 
      height: '100%', 
      overflowY: 'auto' 
    },
    mainContent: { 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      height: '100vh', 
      overflow: 'hidden' 
    },
    userDropdown: {
      cursor: 'pointer', 
      position: 'relative', 
      color: '#333', 
      padding: '0.4rem 0.8rem', 
      border: '1px solid #ccc', 
      borderRadius: '0.5rem', 
      backgroundColor: '#fff', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', 
      transition: 'box-shadow 0.3s ease', 
      marginRight: '0.625rem', 
      display: 'inline-block', 
      whiteSpace: 'nowrap'
    },
    dropdownMenu: {
      position: 'absolute', 
      top: '2.5rem', 
      right: 0, 
      background: '#fff', 
      border: '1px solid #ccc', 
      borderRadius: '0.5rem', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)', 
      zIndex: 100
    },
    dropdownItem: { 
      padding: '0.625rem', 
      cursor: 'pointer', 
      fontWeight: '500', 
      fontSize: '0.875rem', 
      color: '#333' 
    },
    logoutModal: {
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000
    },
    logoutModalContent: {
      backgroundColor: '#fff', 
      padding: '30px', 
      borderRadius: '12px', 
      textAlign: 'center', 
      fontSize: '1rem', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '10px'
    }
  };

  const MenuItem = ({ icon, text, action }) => {
    const isActive = activeMenu === action;
    return (
      <motion.div
        style={{ ...styles.menuItem, backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent' }}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
        onClick={() => handleMenuClick(action)}
      >
        <img src={icon} alt={text} style={styles.icon} />
        <span>{text}</span>
      </motion.div>
    );
  };

  return (
    <div style={styles.pageContainer}>
      <button style={styles.hamburgerButton} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div style={styles.overlay} onClick={() => setIsSidebarOpen(false)} />

      <div style={styles.sidebar}>
        <div style={styles.sidebarContent}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Menú</h3>
          <MenuItem icon={controlIcon} text="Control de Atrasos" action="attendance" />
          <MenuItem icon={reportIcon} text="Reportes" action="reports" />
          <MenuItem icon={messageIcon} text="Mensajería" action="atrasos" />
          {userRole && (userRole === 1) && (
            <MenuItem icon={studentIcon} text="Alumnos" action="estudiantes" />
          )}
          {userRole && (userRole === 1 || userRole === 3) && (
            <MenuItem icon={agregarIcon} text="Registrar Usuario" action="registro" />
          )}
          <div style={styles.separator}></div>
          <div style={styles.whatsappStatus}>
            {whatsappConnected ? '✅ WhatsApp conectado' : '❌ WhatsApp desconectado'}
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.topbar}>
          <div style={styles.topbarContent}>
            <div style={styles.userDropdown} onClick={() => setShowLogout(!showLogout)}>
              {userName} ▼
              {showLogout && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={16} style={{ marginRight: '8px' }} />Cerrar Sesión
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.div style={styles.contentArea} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {activeMenu === 'home' && (
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4">Bienvenido, {userName}!</h3>
            </div>
          )}
          {activeMenu === 'attendance' && <AttendancePage />}
          {activeMenu === 'reports' && <ReportsPage />}
          {activeMenu === 'atrasos' && <AtrasosPage />}
          {activeMenu === 'estudiantes' && <EstudiantesPage />}
          {activeMenu === 'registro' && <RegisterPage />}
        </motion.div>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            style={styles.logoutModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.logoutModalContent}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <FaSpinner className="spinner" style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }} />
              Cerrando sesión...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
