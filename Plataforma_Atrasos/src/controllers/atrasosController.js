const db = require('../config/db');
const pdfController = require('./PDFController')

// Obtener todos los atrasos
exports.getAllAtrasos = (req, res) => {
    const query = `
        SELECT A.RUT_ALUMNO, A.FECHA_ATRASOS, A.JUSTIFICATIVO, 
               CONCAT(B.NOMBRE_ALUMNO, ' ', B.SEGUNDO_NOMBRE_ALUMNO, ' ', B.APELLIDO_PATERNO_ALUMNO, ' ', B.APELLIDO_MATERNO_ALUMNO) AS NOMBRE_COMPLETO, 
               C.NOMBRE_CURSO
        FROM ATRASOS A
        JOIN ALUMNOS B ON A.RUT_ALUMNO = B.RUT_ALUMNO
        JOIN CURSOS C ON B.COD_CURSO = C.COD_CURSO
        GROUP BY A.COD_ATRASOS
    `;
    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener los atrasos' });
        }
        res.status(200).json(results);
    });
};


// Registrar un nuevo atraso
exports.createAtraso = (req, res) => {
    const { rutAlumno, justificativo } = req.body;
    const fechaAtrasos = new Date();

    if (!rutAlumno || !fechaAtrasos) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const query = 'INSERT INTO ATRASOS (RUT_ALUMNO, FECHA_ATRASOS, JUSTIFICATIVO) VALUES (?, ?, ?)';

    db.query(query, [rutAlumno, fechaAtrasos, justificativo], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al insertar el atraso' });
        }
       // res.status(201).json({ message: 'Atraso creado con éxito', id: results.insertId });
    });

    pdfController.fillForm(rutAlumno, fechaAtrasos).catch( (error) => {
        res.status(500).json({error: 'No se pudo generar el PDF'})
   }).finally( () => {
    //res.status(201).json({message: 'Se genero el PDF con exito'})
} )
};

// Actualizar un atraso existente
exports.updateAtraso = (req, res) => {
    const { id } = req.params;
    const { rutAlumno, fechaAtrasos, justificativo } = req.body;

    // Verifica que el justificativo sea un booleano
    if (typeof justificativo !== 'boolean') {
        return res.status(400).json({ error: 'El justificativo debe ser un booleano' });
    }

    const query = 'UPDATE ATRASOS SET RUT_ALUMNO = ?, FECHA_ATRASOS = ?, JUSTIFICATIVO = ? WHERE COD_ATRASOS = ?';

    db.query(query, [rutAlumno, fechaAtrasos, justificativo, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al actualizar el atraso' });
        }
        res.status(200).json({ message: 'Atraso actualizado con éxito' });
    });
};


// Eliminar un atraso
exports.deleteAtraso = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM ATRASOS WHERE COD_ATRASOS = ?';

    db.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al eliminar el atraso' });
        }
        res.status(200).json({ message: 'Atraso eliminado con éxito' });
    });
};
