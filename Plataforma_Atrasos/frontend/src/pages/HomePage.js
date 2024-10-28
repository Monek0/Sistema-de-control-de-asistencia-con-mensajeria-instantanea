import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
// Importa los iconos
import controlIcon from '../assets/icons/control.png';
import reportIcon from '../assets/icons/report.png';
import messageIcon from '../assets/icons/message.png';
import agregarIcon from '../assets/icons/agregar-usuario.png';
import AttendancePage from './AttendancePage';
import ReportsPage from './ReportsPage';
import AtrasosPage from './AtrasosPage';
import RegisterPage from './RegisterPage';
import logo from '../assets/images/logo.png';
import axios from 'axios';

const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [showAttendance, setShowAttendance] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const [showAtrasos, setShowAtrasos] = useState(false);
    const [showRegistro, setShowRegistro] = useState(false);
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
        handleResize(); // Inicializa el estado

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const token = localStorage.getItem('token');
                const rutUsername = localStorage.getItem('RUT_USERNAME');
                const response = await axios.get(`http://localhost:3000/auth/username/${rutUsername}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserName(response.data?.NOMBRE_USUARIO || 'No te encontré');
            } catch (error) {
                console.error("Error al obtener el nombre de usuario:", error);
                setUserName('No te encontré');
            }
        };
        fetchUserName();
    }, []);

    const handleMenuClick = (action) => {
        setShowAttendance(false);
        setShowReports(false);
        setShowAtrasos(false);
        setShowRegistro(false);

        switch(action) {
            case 'attendance':
                setShowAttendance(true);
                break;
            case 'reports':
                setShowReports(true);
                break;
            case 'atrasos':
                setShowAtrasos(true);
                break;
            case 'registro':
                setShowRegistro(true);
                break;
            default:
                break;
        }

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
        },
        hamburgerButton: {
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 50,
            padding: '0.5rem',
            backgroundColor: '#01579b',
            borderRadius: '0.375rem',
            color: 'white',
            display: isMobile ? 'block' : 'none',
            cursor: 'pointer',
        },
        overlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
            display: isMobile && isSidebarOpen ? 'block' : 'none',
        },
        sidebar: {
            position: isMobile ? 'fixed' : 'sticky',
            top: 0,
            left: 0,
            height: '100vh',
            width: '200px',
            backgroundColor: '#01579b',
            color: 'white',
            zIndex: 40,
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
        },
        mainContent: {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minHeight: '100vh',
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
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
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
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: '#c0392b',
            },
        },
        contentArea: {
            padding: '1.5rem',
            flex: 1,
            width: '100%',
        },
        contentWrapper: {
            padding: '20px',
            width: '100%',
        }
    };
    const MenuItem = ({ icon, text, onClick }) => (
        <div 
            style={styles.menuItem} 
            onClick={onClick}
            className="hover:bg-blue-800"
        >
            <img src={icon} alt={text} style={styles.icon} />
            <span>{text}</span>
        </div>
    );

    return (
        <div style={styles.pageContainer}>
            {/* Botón hamburguesa */}
            <button 
                style={styles.hamburgerButton}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            <div 
                style={styles.overlay}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarContent}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Menú</h3>
                    
                    <MenuItem 
                        icon={controlIcon}
                        text="Control de atrasos"
                        onClick={() => handleMenuClick('attendance')}
                    />
                    <MenuItem 
                        icon={reportIcon}
                        text="Reportes"
                        onClick={() => handleMenuClick('reports')}
                    />
                    <MenuItem 
                        icon={messageIcon}
                        text="Mensajería"
                        onClick={() => handleMenuClick('atrasos')}
                    />
                    <MenuItem 
                        icon={agregarIcon}
                        text="Registrar Usuario"
                        onClick={() => handleMenuClick('registro')}
                    />

                    <img src={logo} alt="Logo" style={styles.logo} />
                </div>
            </div>

            {/* Contenido principal */}
            <div style={styles.mainContent}>
                {/* Barra superior */}
                <div style={styles.topbar}>
                    <div style={styles.topbarContent}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            Sistema de Control de Atrasos
                        </h2>
                        <button 
                            style={styles.logoutButton}
                            onClick={handleLogout}
                            className="hover:bg-red-600"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Área de contenido */}
                <div style={styles.contentArea}>
                    {!showAttendance && !showReports && !showAtrasos && !showRegistro && (
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold mb-4">
                                Bienvenido, {userName}!
                            </h3>
                        </div>
                    )}
                    
                    {showAttendance && <AttendancePage />}
                    {showReports && <ReportsPage />}
                    {showAtrasos && <AtrasosPage />}
                    {showRegistro && <RegisterPage />}
                </div>
            </div>
        </div>
    );
};

export default HomePage;