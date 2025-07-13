const { format } = require('date-fns');
const PDFDocumentLib = require('pdf-lib');
const PDFDocument = PDFDocumentLib.PDFDocument;
const { getClient } = require('../config/db');
const fs = require('fs');

// ✅ Leer los archivos una sola vez al inicio del módulo
const formPdfBytes = fs.readFileSync('../Plataforma_Atrasos/frontend/src/assets/images/form.pdf');
const logoImageBytes = fs.readFileSync('../Plataforma_Atrasos/frontend/src/assets/images/logo.png');

// Función para formatear la fecha en hora local de Santiago, Chile
function formatDateInChile(date) {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

exports.fillForm = async (rutAlumno, fechaAtraso) => {
  const query = 'SELECT rut_alumno, nombre_alumno, segundo_nombre_alumno, apellido_paterno_alumno, apellido_materno_alumno FROM alumnos WHERE rut_alumno = $1';
  let client;

  try {
    client = await getClient();
    const result = await client.query(query, [rutAlumno]);
    
    if (result.rows.length === 0) {
      throw new Error('No se encontraron datos del alumno');
    }

    const datosAlumno = result.rows[0];

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const form = pdfDoc.getForm();

    const colegioField = form.getTextField('colegio');
    const fechaField = form.getTextField('fecha');
    const cuerpoField = form.getTextField('cuerpo');
    const logoImageField = form.getButton('logo');

    const fechaFormateada = formatDateInChile(fechaAtraso);

    colegioField.setText('INSUCO');
    fechaField.setText(fechaFormateada);

    const nombreCompleto = [
      datosAlumno.nombre_alumno
    ].join(' ');

    cuerpoField.setText(`Estimado Apoderado(a),\n\nLe informamos que su pupilo(a) ${nombreCompleto}, RUT ${datosAlumno.rut_alumno}, ha registrado un atraso con fecha ${fechaFormateada}.`);

    logoImageField.setImage(logoImage);

    form.flatten();
    const pdfBytes = await pdfDoc.save();

    function generatePDFFileName() {
      const now = new Date();
      const fechaArchivo = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now).replace(/[^\d]/g, '_'); // reemplaza / y : por _
      return `../Plataforma_Atrasos/src/SalidaPDF/${fechaArchivo}.pdf`;
    }

    const pdfFileName = generatePDFFileName();

    return new Promise((resolve, reject) => {
      fs.writeFile(pdfFileName, pdfBytes, (err) => {
        if (err) {
          reject('Error al escribir el archivo PDF');
        } else {
          resolve(pdfFileName);
        }
      });
    });

  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('Error al generar PDF. No se pudieron consultar los datos del alumno');
  } finally {
    if (client) client.release();
  }
};