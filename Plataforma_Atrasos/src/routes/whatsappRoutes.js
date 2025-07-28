// routes/whatsappRoutes.js - Versión corregida sin columna 'activo'
const express = require('express');
const router = express.Router();
const {
  sendGlobalMessage,
  sendGlobalMessageByCourse,
  sendGlobalMessageToAll,
  sendMessageToStudent,
  getContactStats
} = require('../controllers/whatsappController');
const { getClient } = require('../config/db');

// Middleware de validación
const validateMessageRequest = (req, res, next) => {
  const { tipoEnvio, mensaje, codCurso, codAlumno, rutAlumno } = req.body;
  
  // Validar mensaje
  if (!mensaje || mensaje.trim().length === 0) {
    return res.status(400).json({
      error: "Datos inválidos",
      message: "El mensaje es requerido"
    });
  }
  
  if (mensaje.length > 500) {
    return res.status(400).json({
      error: "Datos inválidos", 
      message: "El mensaje no puede exceder 500 caracteres"
    });
  }
  
  // Validar tipo de envío
  if (!["todos", "curso", "alumno"].includes(tipoEnvio)) {
    return res.status(400).json({
      error: "Datos inválidos",
      message: "Tipo de envío inválido"
    });
  }
  
  // Validaciones específicas por tipo
  if (tipoEnvio === "curso" && !codCurso) {
    return res.status(400).json({
      error: "Datos inválidos",
      message: "Código de curso es requerido"
    });
  }
  
  if (tipoEnvio === "alumno" && !codAlumno && !rutAlumno) {
    return res.status(400).json({
      error: "Datos inválidos", 
      message: "Código de alumno o RUT es requerido"
    });
  }
  
  next();
};

// Función para formatear RUT
const formatRut = (rut) => {
  return rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
};

// Función para validar formato de RUT
const validateRutFormat = (rut) => {
  const rutRegex = /^\d{7,8}-[\dkK]$/i;
  return rutRegex.test(rut);
};

// Endpoint principal para envío de mensajes
router.post('/global-message', validateMessageRequest, async (req, res) => {
  const { tipoEnvio, mensaje, codCurso, codAlumno, rutAlumno } = req.body;
  const client = await getClient();
  
  try {
    let resultado;
    
    if (tipoEnvio === 'todos') {
      resultado = await sendGlobalMessageToAll(mensaje);
    } else if (tipoEnvio === 'curso') {
      // ✅ Verificar que el curso existe (sin columna activo)
      const { rows: cursoCheck } = await client.query(`
        SELECT cod_curso, nombre_curso FROM cursos WHERE cod_curso = $1
      `, [codCurso]);
      
      if (cursoCheck.length === 0) {
        return res.status(404).json({
          error: "Curso no encontrado",
          message: `No existe el curso con código: ${codCurso}`
        });
      }
      
      resultado = await sendGlobalMessageByCourse(codCurso, mensaje);
    } else if (tipoEnvio === 'alumno') {
      let alumnoCode = codAlumno;
      
      // Si se proporciona RUT, buscar el código del alumno
      if (rutAlumno) {
        const formattedRut = formatRut(rutAlumno);
        
        if (!validateRutFormat(formattedRut)) {
          return res.status(400).json({
            error: "RUT inválido",
            message: "El formato del RUT debe ser: 12345678-9"
          });
        }
        
        // ✅ Buscar alumno por RUT (sin columna activo)
        const { rows: alumnoCheck } = await client.query(`
          SELECT cod_alumno FROM alumnos WHERE rut_alumno = $1
        `, [formattedRut]);
        
        if (alumnoCheck.length === 0) {
          return res.status(404).json({
            error: "Alumno no encontrado",
            message: `No existe alumno con RUT: ${formattedRut}`
          });
        }
        
        alumnoCode = alumnoCheck[0].cod_alumno;
      } else if (codAlumno) {
        // ✅ Verificar que el alumno existe (sin columna activo)
        const { rows: alumnoCheck } = await client.query(`
          SELECT cod_alumno FROM alumnos WHERE cod_alumno = $1
        `, [codAlumno]);
        
        if (alumnoCheck.length === 0) {
          return res.status(404).json({
            error: "Alumno no encontrado",
            message: `No existe alumno con código: ${codAlumno}`
          });
        }
      }
      
      resultado = await sendMessageToStudent(alumnoCode, mensaje);
    } else {
      return res.status(400).json({
        error: "Datos inválidos",
        message: 'Faltan datos para el tipo de envío seleccionado.'
      });
    }
    
    // Formatear respuesta para el frontend
    const response = {
      success: resultado.success,
      message: resultado.message,
      enCola: resultado.total,
      detalles: {
        tipoEnvio,
        totalDestinatarios: resultado.total,
        enviados: resultado.enviados,
        errores: resultado.errores,
        timestamp: new Date().toISOString(),
        ...(codCurso && { curso: codCurso }),
        ...(codAlumno && { alumno: codAlumno }),
        ...(rutAlumno && { rut: rutAlumno })
      }
    };
    
    return res.status(200).json(response);
    
  } catch (err) {
    console.error('❌ Error al procesar global-message:', err.message);
    return res.status(500).json({
      error: "Error interno del servidor",
      message: 'Error interno al enviar mensajes.'
    });
  } finally {
    client.release();
  }
});

// Obtener estadísticas de contactos
router.get('/stats', async (req, res) => {
  try {
    const stats = await getContactStats();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener las estadísticas"
    });
  }
});

// Obtener estado de WhatsApp (si está conectado)
router.get('/status', (req, res) => {
  // Este endpoint puede ser útil para verificar el estado de conexión
  // Implementarás la lógica según tu controlador de WhatsApp
  res.json({
    status: 'connected', // o 'disconnected', 'connecting', etc.
    timestamp: new Date().toISOString()
  });
});

// Endpoint para pruebas (desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.post('/test-message', async (req, res) => {
    const { numero, mensaje } = req.body;
    
    if (!numero || !mensaje) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: "Número y mensaje son requeridos"
      });
    }
    
    try {
      // Aquí podrías llamar directamente a sendMessage para pruebas
      res.json({
        success: true,
        message: "Mensaje de prueba simulado",
        numero,
        mensaje
      });
    } catch (error) {
      res.status(500).json({
        error: "Error en mensaje de prueba",
        message: error.message
      });
    }
  });
}

module.exports = router;