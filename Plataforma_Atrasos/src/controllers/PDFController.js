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

    colegioField.setText('INSUCO');
    fechaField.setText(fechaAtraso.toLocaleString());

    cuerpoField.setText("Estimado Apoderado(a), \n\nLe informarmos que su pupilo(a) " + [datosAlumno.nombre_alumno, datosAlumno.segundo_nombre_alumno, datosAlumno.apellido_paterno_alumno, datosAlumno.apellido_materno_alumno].reduce((acc, cv) =>
      acc + cv + " ", "") + "RUT " + datosAlumno.rut_alumno + " ha registrado un atraso con fecha " + fechaAtraso.toLocaleString() + ".");

    logoImageField.setImage(logoImage);

    form.flatten();
    const pdfBytes = await pdfDoc.save();

    function generatePDFFileName() {
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}`;
      return `../Plataforma_Atrasos/src/SalidaPDF/${formattedDate}.pdf`;
    }
    
    const pdfFileName = generatePDFFileName();
    
    // Rewrite the file writing part using a promise
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