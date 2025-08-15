import React from 'react';

export default function ServiceSuspendedPage() {
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #7f1d1d 50%, #1e293b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    },
    backgroundElement1: {
      position: 'absolute',
      top: '-10rem',
      right: '-10rem',
      width: '20rem',
      height: '20rem',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },
    backgroundElement2: {
      position: 'absolute',
      bottom: '-10rem',
      left: '-10rem',
      width: '24rem',
      height: '24rem',
      backgroundColor: 'rgba(251, 146, 60, 0.2)',
      borderRadius: '50%',
      animation: 'pulse 2s infinite 1s'
    },
    backgroundElement3: {
      position: 'absolute',
      top: '33%',
      left: '25%',
      width: '8rem',
      height: '8rem',
      backgroundColor: 'rgba(248, 113, 113, 0.1)',
      borderRadius: '50%',
      animation: 'bounce 2s infinite 0.5s'
    },
    backgroundElement4: {
      position: 'absolute',
      bottom: '25%',
      right: '33%',
      width: '6rem',
      height: '6rem',
      backgroundColor: 'rgba(251, 191, 36, 0.15)',
      borderRadius: '50%',
      animation: 'bounce 2s infinite 0.7s'
    },
    card: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '48rem',
      margin: '0 auto',
      textAlign: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      borderRadius: '1.5rem',
      padding: '3rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '3rem',
      position: 'relative'
    },
    iconCircle: {
      width: '8rem',
      height: '8rem',
      background: 'linear-gradient(135deg, #ef4444, #f97316)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      animation: 'pulse 2s infinite'
    },
    icon: {
      width: '4rem',
      height: '4rem',
      fill: 'white',
      animation: 'bounce 2s infinite'
    },
    ripple1: {
      position: 'absolute',
      inset: '0',
      width: '8rem',
      height: '8rem',
      borderRadius: '50%',
      border: '4px solid rgba(248, 113, 113, 0.5)',
      animation: 'ping 2s infinite'
    },
    ripple2: {
      position: 'absolute',
      inset: '0.5rem',
      width: '7rem',
      height: '7rem',
      borderRadius: '50%',
      border: '2px solid rgba(251, 146, 60, 0.3)',
      animation: 'ping 2s infinite 0.5s'
    },
    title: {
      fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, #f87171, #fb923c)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    dotsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    dot1: {
      width: '0.75rem',
      height: '0.75rem',
      backgroundColor: '#f87171',
      borderRadius: '50%',
      animation: 'bounce 2s infinite'
    },
    dot2: {
      width: '0.75rem',
      height: '0.75rem',
      backgroundColor: '#fb923c',
      borderRadius: '50%',
      animation: 'bounce 2s infinite 0.2s'
    },
    dot3: {
      width: '0.75rem',
      height: '0.75rem',
      backgroundColor: '#fbbf24',
      borderRadius: '50%',
      animation: 'bounce 2s infinite 0.5s'
    }
  };

  // Inyectar las animaciones CSS
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(1.05);
        }
      }

      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translateY(0);
        }
        40%, 43% {
          transform: translateY(-30px);
        }
        70% {
          transform: translateY(-15px);
        }
        90% {
          transform: translateY(-4px);
        }
      }

      @keyframes ping {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        75%, 100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.backgroundElement1}></div>
      <div style={styles.backgroundElement2}></div>
      <div style={styles.backgroundElement3}></div>
      <div style={styles.backgroundElement4}></div>

      <div style={styles.card}>
        {/* Icon with animation */}
        <div style={styles.iconContainer}>
          <div style={styles.iconCircle}>
            <svg style={styles.icon} viewBox="0 0 24 24">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
          {/* Ripple effects */}
          <div style={styles.ripple1}></div>
          <div style={styles.ripple2}></div>
        </div>

        {/* Main heading */}
        <h1 style={styles.title}>
          Servicio Suspendido
        </h1>

        {/* Animated dots */}
        <div style={styles.dotsContainer}>
          <div style={styles.dot1}></div>
          <div style={styles.dot2}></div>
          <div style={styles.dot3}></div>
        </div>
      </div>
    </div>
  );
}