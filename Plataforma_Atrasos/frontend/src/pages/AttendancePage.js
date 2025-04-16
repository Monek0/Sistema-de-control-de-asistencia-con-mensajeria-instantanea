import React, { useState } from 'react';
import AttendanceForm from '../components/Attendance/AttendanceForm';
import WhatsappLoginModal from '../components/WhatsappLoginModal';

const AttendancePage = () => {
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);

    const styles = {
        pageContainer: {
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
        },
        formContainer: {
            flex: 1,
            maxWidth: '600px',
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
            <button
                onClick={() => setShowWhatsappModal(true)}
                style={styles.whatsappButton}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#013f73'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#01579b'}
            >
                Iniciar sesión con WhatsApp
            </button>

            <WhatsappLoginModal 
              isOpen={showWhatsappModal} 
              onRequestClose={() => setShowWhatsappModal(false)} 
            />

            <div style={styles.pageContainer}>
                <div style={styles.formContainer}>
                    <h1>Control de Atrasos</h1>
                    <AttendanceForm />
                </div>
            </div>
        </>
    );
};

export default AttendancePage;
