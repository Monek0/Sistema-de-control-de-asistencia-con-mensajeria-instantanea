import React from 'react';
import AttendanceForm from '../components/Attendance/AttendanceForm';

const AttendancePage = () => {
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
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.formContainer}>
                <h1>Control de Atrasos</h1>
                <AttendanceForm />
            </div>
        </div>
    );
};

export default AttendancePage;
