const { getClient } = require('../config/db');
const pdfController = require('./PDFController');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const { startOfWeek, endOfWeek } = require('date-fns');
const whatsappController = require('./whatsappController');
const PDFDocument = require('pdfkit');
const path = require('path');

whatsappController.initializeClient();
const sendPDF = whatsappController.sendPDF;

const generateBaucher = (data) => {
    const { curso, nombre, rut, fecha, cantidadAtrasos, codAtraso } = data;

    const doc = new PDFDocument({
        size: [283, 150],
        margin: 0,
    });

    doc.font('Helvetica');
    doc.fontSize(10);

    doc.text('Comprobante de Atraso ', {
        align: 'left',
        lineBreak: true,
        baseline: 'top',
        indent: 10,
    });

    doc.moveDown(0.5);
    doc.text(` Curso: ${curso}`, { align: 'left', indent: 10 });
    doc.moveDown(0.5);
    doc.text(`Nombre: ${nombre}`, { align: 'left', indent: 20 });
    doc.moveDown(0.3);
    doc.text(`RUT: ${rut}`, { align: 'left', indent: 20 });
    doc.moveDown(0.3);
    doc.text(`Fecha de Atraso: ${fecha}`, { align: 'left', indent: 20 });
    doc.moveDown(0.3);
    doc.text(`Cantidad de Atrasos: ${cantidadAtrasos}`, { align: 'left', indent: 20 });

    doc.moveDown(1);
    doc.text('----------------------------', { align: 'center' });

    const dir = path.join(__dirname, '../pdfs');
    const fileName = `baucher_atraso_${codAtraso}.pdf`;
    const filePath = path.join(dir, fileName);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    doc.pipe(fs.createWriteStream(filePath));
    doc.end();

    return `/pdfs/${fileName}`;
};

exports.getAllAtrasos = async (req, res) => {
    const query = `
        SELECT 
            a.cod_atrasos,
            a.rut_alumno,
            a.fecha_atrasos,
            a.justificado,
            a.pdf_path,
            CONCAT(b.nombre_alumno) AS nombre_completo,
            c.nombre_curso
        FROM atrasos a
        JOIN alumnos b ON a.rut_alumno = b.rut_alumno
        JOIN cursos c ON b.cod_curso = c.cod_curso
        ORDER BY a.fecha_atrasos DESC
    `;
    let client;

    try {
        client = await getClient();
        const result = await client.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los atrasos:', error);
        return res.status(500).json({ error: 'Error al obtener los atrasos' });
    } finally {
        if (client) client.release();
    }
};

exports.createAtraso = async (req, res) => {
    const { rutAlumno } = req.body;
    const fechaAtrasos = new Date();
    let client;

    if (!rutAlumno) {
        return res.status(400).json({ error: 'Datos faltantes en la solicitud' });
    }

    try {
        client = await getClient();

        const checkRutResult = await client.query('SELECT * FROM alumnos WHERE rut_alumno = $1', [rutAlumno]);
        if (checkRutResult.rows.length === 0) {
            return res.status(404).json({ error: 'El RUT del alumno no existe en la base de datos' });
        }

        const alumno = checkRutResult.rows[0];

        const cursoResult = await client.query('SELECT nombre_curso FROM cursos WHERE cod_curso = $1', [alumno.cod_curso]);
        const curso = cursoResult.rows[0]?.nombre_curso || 'Curso desconocido';

        const insertResult = await client.query(
            'INSERT INTO atrasos (rut_alumno, fecha_atrasos, justificado) VALUES ($1, $2, $3) RETURNING cod_atrasos',
            [rutAlumno, fechaAtrasos, false]
        );

        const codAtraso = insertResult.rows[0].cod_atrasos;

        try {
            const pdfPath = await pdfController.fillForm(rutAlumno, fechaAtrasos);
            const pdfFileName = pdfPath.split('/').pop();

            await client.query('UPDATE atrasos SET pdf_path = $1 WHERE cod_atrasos = $2', [pdfFileName, codAtraso]);

            const celularResult = await client.query('SELECT n_celular_apoderado FROM alumnos WHERE rut_alumno = $1', [rutAlumno]);
            const celularApoderado = celularResult.rows[0]?.n_celular_apoderado;

            if (celularApoderado) {
                await sendPDF(celularApoderado, pdfPath);
            } else {
                return res.status(404).json({ error: 'No se encontró el número de celular del apoderado' });
            }

            const countResult = await client.query('SELECT COUNT(*) FROM atrasos WHERE rut_alumno = $1', [rutAlumno]);
            const cantidadAtrasos = parseInt(countResult.rows[0].count);

            const baucherPath = generateBaucher({
                curso,
                nombre: alumno.nombre_alumno,
                rut: alumno.rut_alumno,
                fecha: new Intl.DateTimeFormat('es-CL', {
                    timeZone: 'America/Santiago',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }).format(fechaAtrasos),
                cantidadAtrasos,
                codAtraso
            });

            return res.status(201).json({
                message: 'Atraso creado con éxito',
                pdfInstitutionalPath: pdfPath,
                baucherPath,
            });
        } catch (pdfError) {
            console.error('Error al procesar el atraso:', pdfError);
            res.status(500).json({ error: 'Error al procesar el atraso y generar PDFs' });
        }
    } catch (error) {
        console.error('Error al crear el atraso:', error);
        res.status(500).json({ error: 'Error al crear el atraso' });
    } finally {
        if (client) client.release();
    }
};

exports.updateAtraso = async (req, res) => {
    const { id } = req.params;
    const { justificado } = req.body;
    let client;

    console.log(`Actualizando atraso ${id} con justificado: ${justificado}`); // Debug log

    if (typeof justificado !== 'boolean') {
        return res.status(400).json({ error: 'El campo "justificado" debe ser un booleano' });
    }

    try {
        client = await getClient();
        
        // Primero verificar que el registro existe
        const checkResult = await client.query('SELECT * FROM atrasos WHERE cod_atrasos = $1', [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Atraso no encontrado' });
        }

        console.log('Atraso antes de actualizar:', checkResult.rows[0]); // Debug log

        // Actualizar el registro
        const updateResult = await client.query(
            'UPDATE atrasos SET justificado = $1 WHERE cod_atrasos = $2 RETURNING *',
            [justificado, id]
        );

        console.log('Atraso después de actualizar:', updateResult.rows[0]); // Debug log

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'No se pudo actualizar el atraso' });
        }

        res.status(200).json({ 
            message: 'Atraso actualizado con éxito',
            atraso: updateResult.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar el atraso:', error);
        return res.status(500).json({ error: 'Error al actualizar el atraso' });
    } finally {
        if (client) client.release();
    }
};

exports.deleteAtraso = async (req, res) => {
    const { id } = req.params;
    let client;

    try {
        client = await getClient();
        const result = await client.query('DELETE FROM atrasos WHERE cod_atrasos = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Atraso no encontrado' });
        }

        res.status(200).json({ message: 'Atraso eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el atraso:', error);
        return res.status(500).json({ error: 'Error al eliminar el atraso' });
    } finally {
        if (client) client.release();
    }
};

exports.getAtrasosDelDia = async (req, res) => {
    const { fecha } = req.query;
    let client;

    if (!fecha) {
        return res.status(400).json({ error: 'Se requiere una fecha' });
    }

    const inicioDelDia = new Date(`${fecha}T00:00:00`);
    const finDelDia = new Date(`${fecha}T23:59:59`);

    const query = `
        SELECT 
            a.cod_atrasos,
            a.rut_alumno,
            a.fecha_atrasos,
            a.justificado,
            CONCAT(b.nombre_alumno) AS nombre_completo,
            c.nombre_curso
        FROM atrasos a
        JOIN alumnos b ON a.rut_alumno = b.rut_alumno
        JOIN cursos c ON b.cod_curso = c.cod_curso
        WHERE a.fecha_atrasos BETWEEN $1 AND $2
        ORDER BY a.fecha_atrasos DESC
    `;

    try {
        client = await getClient();
        const result = await client.query(query, [inicioDelDia, finDelDia]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en la consulta SQL:', error);
        return res.status(500).json({ error: 'Error al obtener los atrasos' });
    } finally {
        if (client) client.release();
    }
};

exports.getAtrasosRango = async (req, res) => {
    const { startDate, endDate } = req.query;
    let client;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Se requieren ambas fechas: startDate y endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ error: 'Formato de fecha inválido. Usa YYYY-MM-DD' });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const query = `
        SELECT 
            a.cod_atrasos,
            a.rut_alumno,
            a.fecha_atrasos,
            a.justificado,
            CONCAT(b.nombre_alumno) AS nombre_completo,
            c.nombre_curso
        FROM 
            atrasos a
        JOIN 
            alumnos b ON a.rut_alumno = b.rut_alumno
        JOIN 
            cursos c ON b.cod_curso = c.cod_curso
        WHERE 
            a.fecha_atrasos BETWEEN $1 AND $2
        ORDER BY 
            a.fecha_atrasos DESC
    `;

    try {
        client = await getClient();
        const result = await client.query(query, [start, end]);
        res.status(200).json({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            atrasos: result.rows
        });
    } catch (error) {
        console.error('Error en la consulta de atrasos por rango:', error);
        return res.status(500).json({ error: 'Error al obtener los atrasos por rango' });
    } finally {
        if (client) client.release();
    }
};

exports.verificarRut = async (req, res) => {
    const { rut } = req.params;
    let client;

    if (!rut) {
        return res.status(400).json({ error: 'RUT no proporcionado' });
    }

    try {
        client = await getClient();
        const result = await client.query('SELECT COUNT(*) as count FROM alumnos WHERE rut_alumno = $1', [rut]);
        const exists = parseInt(result.rows[0].count) > 0;
        res.json({ exists });
    } catch (error) {
        console.error('Error al verificar RUT:', error);
        return res.status(500).json({ error: 'Error al verificar el RUT' });
    } finally {
        if (client) client.release();
    }
};