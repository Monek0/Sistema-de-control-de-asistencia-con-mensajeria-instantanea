const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

let client = null;
let ioSocket = null;
let isInitializing = false;
let isReady = false;

const setSocket = (io) => {
  ioSocket = io;

  io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado al WebSocket');

    socket.on('logout', async () => {
      console.log('🔴 Logout solicitado desde el frontend');
      if (client) {
        try {
          await client.logout();
          await client.destroy();
          client = null;
          isInitializing = false;
          isReady = false;

          const sessionPath = path.join('/tmp', '.wwebjs_auth', 'plataforma-atrasos-whatsapp');
          const cachePath = path.join(__dirname, 'Plataforma_Atrasos', '.wwebjs_cache');
          fs.rmSync(sessionPath, { recursive: true, force: true });
          fs.rmSync(cachePath, { recursive: true, force: true });

          console.log('✅ Sesión cerrada y datos eliminados');
          socket.emit('disconnected', 'Sesión cerrada manualmente');

          await initializeClient(); // Reinicia limpio
        } catch (err) {
          console.error('❌ Error al cerrar sesión:', err);
        }
      }
    });

    socket.on('get_status', () => {
      if (isReady && client?.info?.wid) {
        console.log('🔍 Estado solicitado → Cliente autenticado');
        socket.emit('authenticated');
      } else {
        console.log('🔍 Estado solicitado → Cliente no autenticado');
        socket.emit('not_authenticated');
      }
    });
  });
};

const initializeClient = async () => {
  if (isInitializing || isReady) {
    console.log('⏳ Cliente ya está inicializándose o listo, se omite');
    return;
  }

  isInitializing = true;
  console.log('⚙️ Inicializando cliente de WhatsApp con LocalAuth...');

  client = new Client({
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth({
      clientId: 'plataforma-atrasos-whatsapp',
      dataPath: path.join('/tmp', '.wwebjs_auth')
    })
  });

  registerEvents(client);
  client.initialize();
};

const registerEvents = (clientInstance) => {
  clientInstance.on('qr', async (qr) => {
    if (ioSocket) {
      const QRCode = require('qrcode');
      try {
        const qrImage = await QRCode.toDataURL(qr);
        ioSocket.emit('qr', qrImage);
      } catch (err) {
        console.error('Error generando QR base64:', err);
      }
    }
  });

  clientInstance.on('authenticated', () => {
    console.log('✅ Cliente autenticado');
    isReady = true;
    isInitializing = false;
    if (ioSocket) ioSocket.emit('authenticated');
  });

  clientInstance.on('auth_failure', () => {
    console.log('❌ Fallo de autenticación');
    isReady = false;
    isInitializing = false;
    if (ioSocket) ioSocket.emit('auth_failure');
  });

  clientInstance.on('ready', () => {
    console.log('📱 WhatsApp listo para usar');
    isReady = true;
    isInitializing = false;
    if (ioSocket) ioSocket.emit('ready');
  });

  clientInstance.on('disconnected', async (reason) => {
    console.log('⚠️ Desconectado:', reason);
    isReady = false;
  
    if (isInitializing) {
      console.log('⏳ Ya se está reinicializando tras desconexión');
      return;
    }
  
    isInitializing = true;
    if (ioSocket) ioSocket.emit('disconnected', reason);
  
    try {
      await clientInstance.destroy();
      client = null;
      await initializeClient();
    } catch (err) {
      console.error('❌ Error reiniciando cliente:', err);
      isInitializing = false;
    }
  });
};

const sendPDF = async (number, filePath) => {
  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    console.log(`📤 Enviando PDF a ${formattedNumber}`);

    if (filePath && fs.existsSync(filePath)) {
      const media = await MessageMedia.fromFilePath(filePath);
      await client.sendMessage(formattedNumber, media);
      console.log('✅ PDF enviado');
    } else {
      console.error('❌ El archivo no existe o la ruta es incorrecta');
    }
  } catch (error) {
    console.error('❌ Error al enviar PDF:', error);
  }
};

const { getClient } = require('../config/db');

// Delay para evitar detección como spam (en ms)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Función para enviar mensaje a un número específico
const sendMessage = async (numero, mensaje) => {
  const formattedNumber = numero.includes('@c.us') ? numero : `${numero}@c.us`;
  
  try {
    console.log(`📨 Enviando mensaje a ${formattedNumber}`);
    await client.sendMessage(formattedNumber, mensaje);
    console.log('✅ Mensaje enviado');
    return { success: true };
  } catch (err) {
    console.error(`❌ Error enviando a ${formattedNumber}:`, err.message);
    return { success: false, error: err.message };
  }
};

// Función principal para envío de mensajes globales
const sendGlobalMessage = async (tipoEnvio, mensaje, opciones = {}) => {
  const clientDb = await getClient();
  let enviados = 0;
  let errores = 0;
  let total = 0;

  try {
    let alumnos = [];

    switch (tipoEnvio) {
      case 'todos':
        // Obtener todos los alumnos con número de celular
        const { rows: todosAlumnos } = await clientDb.query(`
          SELECT nombre_alumno, n_celular_apoderado, cod_curso
          FROM alumnos
          WHERE n_celular_apoderado IS NOT NULL AND n_celular_apoderado != ''
          ORDER BY cod_curso, nombre_alumno
        `);
        alumnos = todosAlumnos;
        break;

      case 'curso':
        // Obtener alumnos de un curso específico
        const { rows: alumnosCurso } = await clientDb.query(`
          SELECT nombre_alumno, n_celular_apoderado, cod_curso
          FROM alumnos
          WHERE cod_curso = $1 AND n_celular_apoderado IS NOT NULL AND n_celular_apoderado != ''
          ORDER BY nombre_alumno
        `, [opciones.codCurso]);
        alumnos = alumnosCurso;
        break;

      case 'alumno':
        // Obtener un alumno específico
        const { rows: alumnoEspecifico } = await clientDb.query(`
          SELECT nombre_alumno, n_celular_apoderado, cod_curso
          FROM alumnos
          WHERE cod_alumno = $1 AND n_celular_apoderado IS NOT NULL AND n_celular_apoderado != ''
        `, [opciones.codAlumno]);
        alumnos = alumnoEspecifico;
        break;

      default:
        throw new Error('Tipo de envío no válido');
    }

    total = alumnos.length;

    if (total === 0) {
      return {
        success: false,
        message: 'No se encontraron destinatarios con números de teléfono válidos',
        enviados: 0,
        errores: 0,
        total: 0
      };
    }

    console.log(`📊 Iniciando envío ${tipoEnvio}: ${total} destinatarios`);

    // Enviar mensajes
    for (const alumno of alumnos) {
      const numero = alumno.n_celular_apoderado;
      const nombre = alumno.nombre_alumno;

      const mensajeCompleto = `Estimado apoderado de ${nombre}, esta es una notificación del Instituto Superior de Comercio. ${mensaje}`;

      const resultado = await sendMessage(numero, mensajeCompleto);

      if (resultado.success) {
        enviados++;
      } else {
        errores++;
      }

      // Emitir progreso via socket si está disponible
      if (ioSocket) {
        ioSocket.emit('message_progress', {
          actual: enviados + errores,
          total: total,
          enviados: enviados,
          errores: errores
        });
      }

      // Esperar 3-5 segundos antes del siguiente envío para evitar spam
      const delayTime = Math.floor(Math.random() * 2000) + 3000; // 3-5 segundos
      await delay(delayTime);
    }

    const porcentajeExito = Math.round((enviados / total) * 100);

    return {
      success: true,
      message: `Envío completado: ${enviados}/${total} mensajes enviados exitosamente (${porcentajeExito}%)`,
      enviados: enviados,
      errores: errores,
      total: total
    };

  } catch (err) {
    console.error('❌ Error en envío global:', err.message);
    throw err;
  } finally {
    clientDb.release();
  }
};

// Funciones específicas para mantener compatibilidad
const sendGlobalMessageByCourse = async (cursoCodigo, mensajePersonalizado) => {
  return await sendGlobalMessage('curso', mensajePersonalizado, { codCurso: cursoCodigo });
};

const sendGlobalMessageToAll = async (mensajePersonalizado) => {
  return await sendGlobalMessage('todos', mensajePersonalizado);
};

const sendMessageToStudent = async (codAlumno, mensajePersonalizado) => {
  return await sendGlobalMessage('alumno', mensajePersonalizado, { codAlumno: codAlumno });
};

// Función para obtener estadísticas de contactos
const getContactStats = async () => {
  const clientDb = await getClient();
  try {
    const { rows } = await clientDb.query(`
      SELECT 
        COUNT(*) as total_alumnos,
        COUNT(CASE WHEN n_celular_apoderado IS NOT NULL AND n_celular_apoderado != '' THEN 1 END) as con_telefono,
        COUNT(CASE WHEN n_celular_apoderado IS NULL OR n_celular_apoderado = '' THEN 1 END) as sin_telefono,
        COUNT(DISTINCT cod_curso) as total_cursos
      FROM alumnos
    `);

    return rows[0];
  } catch (err) {
    console.error('❌ Error obteniendo estadísticas:', err);
    throw err;
  } finally {
    clientDb.release();
  }
};

module.exports = {
  initializeClient,
  setSocket,
  sendPDF,
  sendGlobalMessage,
  sendGlobalMessageByCourse,
  sendGlobalMessageToAll,
  sendMessageToStudent,
  sendMessage,
  getContactStats
};