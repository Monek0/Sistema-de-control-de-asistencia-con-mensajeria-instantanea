import React, { useState } from 'react';
import AttendanceForm from '../components/Attendance/AttendanceForm';
import AttendanceList from '../components/Attendance/AttendanceList';
import WhatsappLoginModal from '../components/WhatsappLoginModal';

const AttendancePage = () => {
    const [showAttendanceList, setShowAttendanceList] = useState(false);
    const [selectedAtraso, setSelectedAtraso] = useState(null);
    const [updated, setUpdated] = useState(false);
    
    // Nuevo estado para controlar la visibilidad del modal de WhatsApp
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);

    const toggleAttendanceList = () => {
        setShowAttendanceList(prev => !prev);
        setSelectedAtraso(null);
    };

    const handleEdit = (atraso) => {
        setSelectedAtraso(atraso);
        setShowAttendanceList(false);
    };

    const handleSuccess = () => {
        setUpdated(prev => !prev);
    };

    const styles = {
        pageContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '20px',
        },
        formContainer: {
            flex: 1,
            marginRight: '20px',
        },
        listContainer: {
            flex: 1,
            maxHeight: '800px',
            overflowY: 'auto',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        toggleButton: {
            padding: '10px 20px',
            backgroundColor: showAttendanceList ? '#e74c3c' : '#FF8C00',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'background-color 0.3s ease',
        },
        buttonText: {
            fontWeight: 'bold',
        },
        whatsappButton: {
            padding: '10px 15px',
            backgroundColor: '#01579b',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.3s',
            margin: '20px',
        }
    };

    return (
        <>
            {/* Botón para abrir el modal de WhatsApp */}
            <button
                onClick={() => setShowWhatsappModal(true)}
                style={styles.whatsappButton}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#013f73'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#01579b'}
            >
                Iniciar sesión con WhatsApp
            </button>
            {/* Modal de WhatsApp */}
            <WhatsappLoginModal 
              isOpen={showWhatsappModal} 
              onRequestClose={() => setShowWhatsappModal(false)} 
            />

            <div style={styles.pageContainer}>
                {/* Contenedor del Formulario */}
                <div style={styles.formContainer}>
                    <h1>Control de Atrasos</h1>
                    <AttendanceForm 
                        onSuccess={handleSuccess}
                        currentData={selectedAtraso}
                        onToggleList={toggleAttendanceList}
                    />
                    <button onClick={toggleAttendanceList} style={styles.toggleButton}>
                        <span style={styles.buttonText}>
                            {showAttendanceList ? 'Ocultar Lista de Atrasos' : 'Mostrar Lista de Atrasos'}
                        </span>
                    </button>
                </div>

                {/* Contenedor de la Lista */}
                {showAttendanceList && (
                    <div style={styles.listContainer}>
                        <AttendanceList onEdit={handleEdit} updated={updated} />
                    </div>
                )}
            </div>
        </>
    );
};

export default AttendancePage;
