const { format, utcToZonedTime } = require('date-fns-tz');
const PDFDocumentLib = require('pdf-lib');
const PDFDocument = PDFDocumentLib.PDFDocument;
const pool = require('../config/db');
const fs = require('fs');

exports.fillForm = async (rutAlumno, fechaAtraso) => {
  const query = 'SELECT rut_alumno, nombre_alumno, segundo_nombre_alumno, apellido_paterno_alumno, apellido_materno_alumno FROM alumnos WHERE rut_alumno = $1';
  
  try {
    const result = await pool.query(query, [rutAlumno]);
    if (result.rows.length === 0) {
      throw new Error('No se encontraron datos del alumno');
    }
    
    const datosAlumno = result.rows[0];
    
    const formPdfBytes = fs.readFileSync('..//Plataforma_Atrasos/frontend/src/assets/images/form.pdf');
    const logoImageBytes = fs.readFileSync('..//Plataforma_Atrasos/frontend/src/assets/images/logo.png');

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const form = pdfDoc.getForm();

    const colegioField = form.getTextField('colegio');
    const fechaField = form.getTextField('fecha');
    const cuerpoField = form.getTextField('cuerpo');
    const logoImageField = form.getButton('logo');

    // 🌍 Fecha en zona horaria de Santiago de Chile
    const zonaChile = 'America/Santiago';
    const fechaChile = utcToZonedTime(fechaAtraso, zonaChile);
    const fechaFormateada = format(fechaChile, 'dd/MM/yyyy HH:mm', { timeZone: zonaChile });
 

    colegioField.setText('INSUCO');
    fechaField.setText(fechaAtraso.toLocaleString());

    const nombreCompleto = [
      datosAlumno.nombre_alumno,
      datosAlumno.segundo_nombre_alumno,
      datosAlumno.apellido_paterno_alumno,
      datosAlumno.apellido_materno_alumno
    ].join(' ');

    cuerpoField.setText(`Estimado Apoderado(a),\n\nLe informamos que su pupilo(a) ${nombreCompleto}, RUT ${datosAlumno.rut_alumno}, ha registrado un atraso con fecha ${fechaFormateada}.`);

    logoImageField.setImage(logoImage);

    form.flatten();
    const pdfBytes = await pdfDoc.save();

    function generatePDFFileName() {
      const now = utcToZonedTime(new Date(), zonaChile);
      const fechaArchivo = format(now, 'yyyy-MM-dd_HH-mm-ss', { timeZone: zonaChile });
      return `../Plataforma_Atrasos/src/SalidaPDF/${fechaArchivo}.pdf`;
    }
    
    const pdfFileName = generatePDFFileName();
    
    return new Promise((resolve, reject) => {
      fs.writeFile(pdfFileName, pdfBytes, (err) => {
        if (err) {
          reject('Error al escribir el archivo PDF');
        } else {
          resolve(pdfFileName); // Devolver la ruta del archivo PDF
        }
      });
    });
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('Error al generar PDF. No se pudieron consultar los datos del alumno');
  }
};