import React, { useState, useEffect } from 'react';
import {
  Send,
  Users,
  User,
  GraduationCap,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const GlobalMessageSender = () => {
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [tipoEnvio, setTipoEnvio] = useState('curso');
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [rutAlumno, setRutAlumno] = useState('');
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  // Estilos CSS inline
  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      color: 'white',
      padding: '32px'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '0 0 8px 0'
    },
    headerSubtitle: {
      fontSize: '16px',
      opacity: 0.9,
      margin: 0
    },
    content: {
      padding: '32px'
    },
    section: {
      marginBottom: '32px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#1f2937'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    },
    optionCard: {
      padding: '20px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: 'white'
    },
    optionCardActive: {
      padding: '20px',
      border: '2px solid #3b82f6',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: '#eff6ff',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
    },
    optionContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    optionIcon: {
      color: '#6b7280'
    },
    optionIconActive: {
      color: '#3b82f6'
    },
    optionText: {
      fontWeight: '500',
      color: '#374151'
    },
    optionTextActive: {
      fontWeight: '500',
      color: '#1e40af'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      resize: 'vertical',
      minHeight: '120px'
    },
    helperText: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    summary: {
      padding: '20px',
      borderRadius: '8px',
      borderLeft: '4px solid #3b82f6',
      backgroundColor: '#f8fafc'
    },
    summaryHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    summaryTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937'
    },
    summaryText: {
      fontSize: '14px',
      color: '#6b7280'
    },
    button: {
      width: '100%',
      padding: '16px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    buttonDisabled: {
      width: '100%',
      padding: '16px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    progress: {
      backgroundColor: '#eff6ff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #bfdbfe'
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    progressBar: {
      width: '100%',
      height: '12px',
      backgroundColor: '#bfdbfe',
      borderRadius: '6px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#3b82f6',
      transition: 'width 0.3s ease',
      borderRadius: '6px'
    },
    alert: {
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid'
    },
    alertSuccess: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      color: '#166534'
    },
    alertError: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#dc2626'
    },
    alertContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    alertText: {
      margin: 0
    },
    alertTitle: {
      fontWeight: '600',
      marginBottom: '4px'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px'
    },
    loadingSpinner: {
      width: '32px',
      height: '32px',
      border: '3px solid #e5e7eb',
      borderTop: '3px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  useEffect(() => {
    // Cargar cursos desde la base de datos
    const loadCursos = async () => {
      try {
        setLoading(true);
        setResultado(null);
        
        console.log('🔍 Cargando cursos desde la BD...');
        
        const response = await fetch(process.env.REACT_APP_API_URL + '/api/cursos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los cursos`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Los datos de cursos deben ser un array');
        }
        
        setCursos(data);
        console.log('✅ Cursos cargados desde BD:', data.length);
        
      } catch (err) {
        console.error('Error al obtener cursos:', err);
        setResultado({ 
          tipo: 'error', 
          mensaje: `Error al cargar los cursos: ${err.message}` 
        });
      } finally {
        setLoading(false);
      }
    };

    loadCursos();
  }, []);

  useEffect(() => {
    // Cargar alumnos cuando cambia el curso seleccionado
    if (cursoSeleccionado && tipoEnvio === 'alumno') {
      const loadAlumnos = async () => {
        try {
          setLoadingAlumnos(true);
          setAlumnos([]);
          setResultado(null);
          
          console.log('🔍 Cargando alumnos del curso:', cursoSeleccionado);
          
          const response = await fetch(process.env.REACT_APP_API_URL + `/api/alumnos/curso/${cursoSeleccionado}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar los alumnos del curso`);
          }
          
          const data = await response.json();
          
          if (!Array.isArray(data)) {
            throw new Error('Los datos de alumnos deben ser un array');
          }
          
          setAlumnos(data);
          console.log('✅ Alumnos cargados:', data.length);
          
        } catch (err) {
          console.error('Error al obtener alumnos:', err);
          setResultado({ 
            tipo: 'error', 
            mensaje: `Error al cargar alumnos: ${err.message}` 
          });
        } finally {
          setLoadingAlumnos(false);
        }
      };

      loadAlumnos();
    } else {
      setAlumnos([]);
    }
  }, [cursoSeleccionado, tipoEnvio]);

  // Función para buscar alumno por RUT - Simplificada sin endpoint
  const buscarAlumnoPorRut = async (rut) => {
    if (!rut.trim()) return;
    
    // ✅ Simplemente limpiar otros campos cuando se ingresa RUT
    setCursoSeleccionado('');
    setAlumnoSeleccionado('');
    setResultado({
      tipo: 'success',
      mensaje: `✅ RUT ingresado: ${rut.trim()}. Se buscará automáticamente al enviar el mensaje.`
    });
  };

  const handleEnviar = async () => {
    // Validaciones
    if (!mensajePersonalizado.trim()) {
      setResultado({ tipo: 'error', mensaje: 'Debes escribir un mensaje.' });
      return;
    }

    if (tipoEnvio === 'curso' && !cursoSeleccionado) {
      setResultado({ tipo: 'error', mensaje: 'Debes seleccionar un curso.' });
      return;
    }

    if (tipoEnvio === 'alumno' && !alumnoSeleccionado && !rutAlumno.trim()) {
      setResultado({ tipo: 'error', mensaje: 'Debes seleccionar un alumno o ingresar un RUT.' });
      return;
    }

    setEnviando(true);
    setResultado(null);

    try {
      // Preparar payload según el tipo de envío
      const payload = {
        tipoEnvio,
        mensaje: mensajePersonalizado.trim()
      };

      // Agregar datos específicos según el tipo
      if (tipoEnvio === 'curso') {
        payload.codCurso = cursoSeleccionado;
      } else if (tipoEnvio === 'alumno') {
        if (rutAlumno.trim()) {
          payload.rutAlumno = rutAlumno.trim();
        } else if (alumnoSeleccionado) {
          payload.codAlumno = alumnoSeleccionado;
        }
      }

      console.log('📤 Enviando payload:', payload);

      const response = await fetch(process.env.REACT_APP_API_URL + '/api/global-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Error en el servidor`);
      }

      const data = await response.json();
      
      // ✅ Mensaje simple sin estadísticas detalladas
      setResultado({ 
        tipo: 'success', 
        mensaje: '✅ Los mensajes se están enviando en segundo plano. Se procesarán automáticamente.'
      });

      // Limpiar formulario después del éxito
      setMensajePersonalizado('');
      
    } catch (err) {
      console.error('Error al enviar mensajes:', err);
      setResultado({ 
        tipo: 'error', 
        mensaje: err.message || 'Error de conexión al enviar mensajes' 
      });
    } finally {
      setEnviando(false);
    }
  };

  const getTipoEnvioInfo = () => {
    switch (tipoEnvio) {
      case 'todos':
        return { icono: <Users size={20} />, texto: 'Todos los cursos' };
      case 'curso':
        return { icono: <GraduationCap size={20} />, texto: 'Un curso específico' };
      case 'alumno':
        return { icono: <User size={20} />, texto: 'Un apoderado específico' };
      default:
        return { icono: <MessageSquare size={20} />, texto: '' };
    }
  };

  const { icono, texto } = getTipoEnvioInfo();

  // Agregar keyframes para animaciones
  const keyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{keyframes}</style>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <MessageSquare size={40} />
              <div>
                <h1 style={styles.headerTitle}>Sistema de Mensajería WhatsApp</h1>
                <p style={styles.headerSubtitle}>Instituto Superior de Comercio</p>
              </div>
            </div>
          </div>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <span style={{ marginLeft: '12px', color: '#6b7280' }}>Cargando cursos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <MessageSquare size={40} />
            <div>
              <h1 style={styles.headerTitle}>Sistema de Mensajería WhatsApp</h1>
              <p style={styles.headerSubtitle}>Instituto Superior de Comercio</p>
            </div>
          </div>
        </div>

        <div style={styles.content}>
          {/* Tipo de envío */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Tipo de envío</h2>
            <div style={styles.grid}>
              {[
                { value: 'todos', icon: <Users size={20} />, label: 'Todos los cursos' },
                { value: 'curso', icon: <GraduationCap size={20} />, label: 'Un curso específico' },
                //{ value: 'alumno', icon: <User size={20} />, label: 'Un apoderado específico' }
              ].map(({ value, icon, label }) => (
                <div
                  key={value}
                  style={tipoEnvio === value ? styles.optionCardActive : styles.optionCard}
                  onClick={() => {
                    setTipoEnvio(value);
                    setCursoSeleccionado('');
                    setAlumnoSeleccionado('');
                    setRutAlumno('');
                  }}
                  onMouseEnter={(e) => {
                    if (tipoEnvio !== value) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tipoEnvio !== value) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={styles.optionContent}>
                    <div style={tipoEnvio === value ? styles.optionIconActive : styles.optionIcon}>
                      {icon}
                    </div>
                    <span style={tipoEnvio === value ? styles.optionTextActive : styles.optionText}>
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Búsqueda por RUT (solo para apoderado específico) */}
          {tipoEnvio === 'alumno' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>RUT del alumno (sin puntos, con guión)</label>
              <input
                type="text"
                style={styles.select}
                placeholder="Ej: 12345678-9"
                value={rutAlumno}
                onChange={(e) => {
                  setRutAlumno(e.target.value);
                  setAlumnoSeleccionado('');
                  setCursoSeleccionado('');
                  setResultado(null);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  if (rutAlumno.trim()) {
                    buscarAlumnoPorRut(rutAlumno);
                  }
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              />
              <p style={styles.helperText}>
                Ingrese el RUT del alumno. Se validará automáticamente al enviar el mensaje.
              </p>
            </div>
          )}

          {/* Selección de curso */}
          {(tipoEnvio === 'curso' || (tipoEnvio === 'alumno' && !rutAlumno.trim())) && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Selecciona un curso</label>
              <select
                style={styles.select}
                value={cursoSeleccionado}
                onChange={(e) => {
                  setCursoSeleccionado(e.target.value);
                  setAlumnoSeleccionado('');
                  setRutAlumno('');
                  setResultado(null);
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="">Seleccione un curso...</option>
                {cursos.map(curso => (
                  <option key={curso.cod_curso} value={curso.cod_curso}>
                    {curso.nombre_curso || curso.cod_curso}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selección de alumno */}
          {tipoEnvio === 'alumno' && cursoSeleccionado && !rutAlumno.trim() && (
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Selecciona un alumno
                {loadingAlumnos && <span style={{ marginLeft: '8px', color: '#6b7280' }}>(Cargando...)</span>}
              </label>
              <select
                style={styles.select}
                value={alumnoSeleccionado}
                onChange={(e) => {
                  setAlumnoSeleccionado(e.target.value);
                  setResultado(null);
                }}
                disabled={loadingAlumnos}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="">
                  {loadingAlumnos ? 'Cargando alumnos...' : 'Seleccione un alumno...'}
                </option>
                {alumnos.map(alumno => (
                  <option key={alumno.cod_alumno} value={alumno.cod_alumno}>
                    {alumno.nombre_alumno} - {alumno.n_celular_apoderado || 'Sin teléfono'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mensaje */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Mensaje personalizado</label>
            <textarea
              style={styles.textarea}
              placeholder="Escribe aquí tu mensaje personalizado. Ejemplo: Le recordamos que mañana hay reunión de apoderados a las 18:00 hrs."
              value={mensajePersonalizado}
              onChange={(e) => setMensajePersonalizado(e.target.value)}
              maxLength={500}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <p style={styles.helperText}>
              {mensajePersonalizado.length}/500 caracteres. El mensaje se enviará con el formato: "Estimado apoderado de [Nombre del alumno], esta es una notificación del Instituto Superior de Comercio. [Tu mensaje]"
            </p>
          </div>

          {/* Resumen del envío */}
          {tipoEnvio && (
            <div style={styles.summary}>
              <div style={styles.summaryHeader}>
                {icono}
                <h3 style={styles.summaryTitle}>Resumen del envío</h3>
              </div>
              <p style={styles.summaryText}>
                <strong>Tipo:</strong> {texto}
                {tipoEnvio === 'curso' && cursoSeleccionado && (
                  <span style={{ marginLeft: '8px' }}>
                    - <strong>{cursos.find(c => c.cod_curso === cursoSeleccionado)?.nombre_curso || cursoSeleccionado}</strong>
                  </span>
                )}
                {tipoEnvio === 'alumno' && alumnoSeleccionado && (
                  <span style={{ marginLeft: '8px' }}>
                    - <strong>{alumnos.find(a => a.cod_alumno === alumnoSeleccionado)?.nombre_alumno}</strong>
                  </span>
                )}
                {tipoEnvio === 'alumno' && rutAlumno && (
                  <span style={{ marginLeft: '8px' }}>
                    - <strong>RUT: {rutAlumno}</strong>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Botón de envío */}
          <div style={styles.section}>
            <button
              style={enviando || !mensajePersonalizado.trim() ? styles.buttonDisabled : styles.button}
              onClick={handleEnviar}
              disabled={enviando || !mensajePersonalizado.trim()}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {enviando ? (
                <div style={styles.spinner}></div>
              ) : (
                <Send size={20} />
              )}
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>

          {/* Resultado */}
          {resultado && (
            <div style={{
              ...styles.alert,
              ...(resultado.tipo === 'success' ? styles.alertSuccess : styles.alertError)
            }}>
              <div style={styles.alertContent}>
                {resultado.tipo === 'success' ? (
                  <CheckCircle size={20} color="#166534" />
                ) : (
                  <AlertCircle size={20} color="#dc2626" />
                )}
                <div>
                  <h4 style={styles.alertTitle}>
                    {resultado.tipo === 'success' ? 'Éxito' : 'Error'}
                  </h4>
                  <p style={styles.alertText}>
                    {resultado.mensaje}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalMessageSender;