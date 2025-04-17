import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { io } from 'socket.io-client';

// Configura el elemento raíz del modal (ajusta según tu app)
Modal.setAppElement('#root');

const getSocketURL = () => {
  return window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://18.217.59.7:443';
};


const WhatsappLoginModal = ({ isOpen, onRequestClose }) => {
  // Estado para el QR, mensaje de estado y bandera de conexión
  const [qrImage, setQrImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Generando código QR, por favor espere...');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Conecta al backend; verifica que la URL sea la correcta (puedes cambiar el puerto o dominio)
      const socketClient = io(getSocketURL());

      setSocket(socketClient);

      socketClient.on('connect', () => {
        console.log('Conectado al servidor de Socket.IO');
      });

      socketClient.on('qr', (data) => {
        console.log('QR recibido');
        setQrImage(data);
        setStatusMessage('Escanea el código QR para iniciar sesión');
      });

      socketClient.on('authenticated', () => {
        console.log('Autenticado');
        setStatusMessage('¡Sesión activa!');
        setIsConnected(true);
        // Puedes cerrar el modal automáticamente o dejarlo abierto para mostrar el estado
        // setTimeout(() => { onRequestClose(); }, 2000);
      });

      socketClient.on('auth_failure', () => {
        console.log('Fallo de autenticación');
        setStatusMessage('Error de autenticación. Intenta nuevamente.');
        setQrImage(null);
        setIsConnected(false);
      });

      socketClient.on('disconnected', (reason) => {
        console.log('Desconectado:', reason);
        setStatusMessage(`Desconectado: ${reason}`);
        setQrImage(null);
        setIsConnected(false);
      });

      // Limpieza al desmontar el componente o cerrar el modal
      return () => {
        socketClient.disconnect();
      };
    }
  }, [isOpen, onRequestClose]);

  // Función para emitir la solicitud de cierre de sesión (logout)
  const handleLogout = () => {
    if (socket) {
      // Emite el evento 'logout'; en el backend deberá gestionarse este evento para cerrar la sesión de WhatsApp
      socket.emit('logout');
      setStatusMessage('Cerrando sesión...');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Inicia sesión con WhatsApp"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          padding: '2rem',
          maxWidth: '400px',
          textAlign: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <h2>Inicia sesión con WhatsApp</h2>

      {isConnected ? (
        <div>
          <p><strong>Estado:</strong> Conectado</p>
          <button
            onClick={handleLogout}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#e74c3c',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#c0392b'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e74c3c'}
          >
            Cerrar sesión de WhatsApp
          </button>
        </div>
      ) : (
        <>
          {qrImage ? (
            <img
              src={qrImage}
              alt="Código QR para iniciar sesión"
              style={{ maxWidth: '100%', margin: '1rem 0' }}
            />
          ) : (
            <div style={{ margin: '1rem 0' }}>
              <p>{statusMessage}</p>
              {/* Spinner simple */}
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(0,0,0,0.1)',
                borderTop: '4px solid #01579b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          <button
            onClick={onRequestClose}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#01579b',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#013f73'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#01579b'}
          >
            Cerrar
          </button>
        </>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
};

export default WhatsappLoginModal;
