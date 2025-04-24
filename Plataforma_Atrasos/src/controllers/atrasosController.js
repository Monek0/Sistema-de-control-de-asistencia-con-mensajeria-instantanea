const pool = require('../config/db');
const pdfController = require('./PDFController');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const { startOfWeek, endOfWeek } = require('date-fns');
const whatsappController = require('./whatsappController');
const PDFDocument = require('pdfkit');
const path = require('path');

// Inicializar cliente de WhatsApp y configurar eventos
whatsappController.initializeClient();
//whatsappController.handleQRGeneration();
//whatsappController.handleAuthentication();
//whatsappController.handleDisconnection();

// Función para enviar un PDF
const sendPDF = whatsappController.sendPDF;

// Función para generar el baucher del atraso
const generateBaucher = (data) => {
    const { curso, nombre, rut, fecha, codAtraso } = data;

    // Crear un documento PDF ajustado al tamaño de una impresora térmica de 80mm (ancho 80mm, altura automática)
    const doc = new PDFDocument({
        size: [283, 150], // 80mm de ancho (283 puntos) y altura predeterminada (841 puntos para tamaño A4)
        margin: 0, // Sin márgenes grandes
    });

    // Establecer la fuente (puedes usar una fuente estándar o alguna específica que sea legible en impresoras térmicas)
    doc.font('Helvetica');

    // Ajustar el tamaño de la fuente
    doc.fontSize(10); // Puedes probar con 9 o 10, dependiendo de cuánto espacio necesites

    // Ajustar la posición del título para moverlo más a la izquierda y hacia arriba
    doc.text('Comprobante de Atraso ', {
        align: 'left', // Alineación a la izquierda
        //continued: true,
        lineBreak: true,
        baseline: 'top',
        indent: 10, // Un pequeño desplazamiento hacia la izquierda
    });

    doc.moveDown(0.5); // Espacio hacia abajo

    // Ajustar el texto del curso, alineado a la izquierda
    doc.text(` Curso: ${curso}`, {
        align: 'left', // Alineación a la izquierda
        indent: 10, // Moverlo un poco hacia la izquierda
    });

    doc.moveDown(0.5); // Un poco más de espacio hacia abajo para el curso

    // Mover los siguientes elementos un poco a la derecha para evitar corte, y reducir el espacio entre ellos
    doc.text(`Nombre: ${nombre}`, {
        align: 'left',
        indent: 20, // Mover hacia la derecha (menos que antes)
    });

    doc.moveDown(0.3); // Menos espacio hacia abajo

    doc.text(`RUT: ${rut}`, {
        align: 'left',
        indent: 20, // Mover hacia la derecha (menos que antes)
    });

    doc.moveDown(0.3); // Menos espacio hacia abajo

    doc.text(`Fecha de Atraso: ${fecha}`, {
        align: 'left',
        indent: 20, // Mover hacia la derecha (menos que antes)
    });

    doc.moveDown(0.3); // Menos espacio hacia abajo

    doc.text(`Código de Atraso: ${codAtraso}`, {
        align: 'left',
        indent: 20, // Mover hacia la derecha (menos que antes)
    });

    // Añadir la línea de separación (si deseas)
    doc.moveDown(1); // Espacio adicional
    doc.text('----------------------------', { align: 'center' });

    // Generar el archivo PDF en la ubicación deseada
    const dir = path.join(__dirname, '../pdfs'); // Ruta del directorio 'pdfs'
    const fileName = `baucher_atraso_${codAtraso}.pdf`;
    const filePath = path.join(dir, fileName);

    // Verificar si el directorio 'pdfs' existe, y crearlo si no
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Crea el directorio y subdirectorios necesarios
    }

    // Escribir el archivo PDF
    doc.pipe(fs.createWriteStream(filePath));
    doc.end();

    return `/pdfs/${fileName}`; // Ruta pública del PDF
};

// Obtener todos los atrasos
exports.getAllAtrasos = async (req, res) => {
    const query = `
        SELECT a.rut_alumno, a.fecha_atrasos, a.justificativo, a.pdf_path,
               CONCAT(b.nombre_alumno, ' ', b.segundo_nombre_alumno, ' ', b.apellido_paterno_alumno, ' ', b.apellido_materno_alumno) AS nombre_completo, 
               c.nombre_curso,
               CASE
                    WHEN a.justificativo = false THEN 'Sin justificativo'
                    ELSE TRIM(
                        BOTH ', ' FROM
                        CONCAT_WS(', ',
                            CASE WHEN b.justificativo_residencia THEN 'R' ELSE NULL END,
                            CASE WHEN b.justificativo_medico THEN 'M' ELSE NULL END,
                            CASE WHEN b.justificativo_deportivo THEN 'D' ELSE NULL END
                        )
                    )
                END AS tipo_justificativo
        FROM atrasos a
        JOIN alumnos b ON a.rut_alumno = b.rut_alumno
        JOIN cursos c ON b.cod_curso = c.cod_curso
        GROUP BY a.cod_atrasos, a.rut_alumno, a.fecha_atrasos, a.justificativo, a.pdf_path, 
                 b.nombre_alumno, b.segundo_nombre_alumno, b.apellido_paterno_alumno, b.apellido_materno_alumno,
                 c.nombre_curso, b.justificativo_residencia, b.justificativo_medico, b.justificativo_deportivo
    `;
    
    try {
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los atrasos:', error);
        return res.status(500).json({ error: 'Error al obtener los atrasos' });
    }
};

// Registrar un nuevo atraso
exports.createAtraso = async (req, res) => {
    const { rutAlumno } = req.body;
    const fechaAtrasos = new Date();

    if (!rutAlumno) {
        return res.status(400).json({ error: 'Datos faltantes en la solicitud' });
    }

    try {
        // Verificar si el alumno existe
        const checkRutResult = await pool.query('SELECT * FROM alumnos WHERE rut_alumno = $1', [rutAlumno]);
        
        if (checkRutResult.rows.length === 0) {
            return res.status(404).json({ error: 'El RUT del alumno no existe en la base de datos' });
        }

        const alumno = checkRutResult.rows[0];

        // Determinar tipo de justificativo
        let tipoJustificativo = 'Sin justificativo';
        let tieneJustificativo = false;

        if (alumno.justificativo_residencia) {
            tipoJustificativo = 'Residencial';
            tieneJustificativo = true;
        } else if (alumno.justificativo_medico) {
            tipoJustificativo = 'Médico';
            tieneJustificativo = true;
        } else if (alumno.justificativo_deportivo) {
            tipoJustificativo = 'Deportivo';
            tieneJustificativo = true;
        }

        // Obtener el curso del alumno
        const cursoResult = await pool.query('SELECT nombre_curso FROM cursos WHERE cod_curso = $1', [alumno.cod_curso]);
        const curso = cursoResult.rows[0]?.nombre_curso || 'Curso desconocido';

        // Insertar el atraso con el tipo de justificativo correcto
        const insertResult = await pool.query(
            'INSERT INTO atrasos (rut_alumno, fecha_atrasos, justificativo, tipo_justificativo) VALUES ($1, $2, $3, $4) RETURNING cod_atrasos',
            [rutAlumno, fechaAtrasos, tieneJustificativo, tipoJustificativo]
        );

        const codAtraso = insertResult.rows[0].cod_atrasos;

        try {
            const pdfPath = await pdfController.fillForm(rutAlumno, fechaAtrasos);
            const pdfFileName = pdfPath.split('/').pop();
            console.log('Nombre del PDF generado:', pdfFileName);

            await pool.query('UPDATE atrasos SET pdf_path = $1 WHERE cod_atrasos = $2', [pdfFileName, codAtraso]);
            console.log('Ruta del PDF actualizada correctamente en la base de datos.');

            const celularResult = await pool.query('SELECT n_celular_apoderado FROM alumnos WHERE rut_alumno = $1', [rutAlumno]);
            const celularApoderado = celularResult.rows[0]?.n_celular_apoderado;

            if (celularApoderado) {
                await sendPDF(celularApoderado, pdfPath);
            } else {
                console.error('Error: No se encontró el número de celular del apoderado.');
                return res.status(404).json({ error: 'No se encontró el número de celular del apoderado' });
            }

            const baucherPath = generateBaucher({
                curso,
                nombre: `${alumno.nombre_alumno} ${alumno.apellido_paterno_alumno} ${alumno.apellido_materno_alumno}`,
                rut: alumno.rut_alumno,
                fecha: fechaAtrasos.toLocaleString(),
                codAtraso,
            });

            console.log('Baucher generado correctamente.');

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
    }
};

// Actualizar un atraso existente
exports.updateAtraso = async (req, res) => {
    const { id } = req.params;
    const { rutAlumno, fechaAtrasos, justificativo } = req.body;

    if (typeof justificativo !== 'boolean') {
        return res.status(400).json({ error: 'El justificativo debe ser un booleano' });
    }

    try {
        await pool.query(
            'UPDATE atrasos SET rut_alumno = $1, fecha_atrasos = $2, justificativo = $3 WHERE cod_atrasos = $4',
            [rutAlumno, fechaAtrasos, justificativo, id]
        );
        res.status(200).json({ message: 'Atraso actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar el atraso:', error);
        return res.status(500).json({ error: 'Error al actualizar el atraso' });
    }
};

// Eliminar un atraso
exports.deleteAtraso = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM atrasos WHERE cod_atrasos = $1', [id]);
        res.status(200).json({ message: 'Atraso eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el atraso:', error);
        return res.status(500).json({ error: 'Error al eliminar el atraso' });
    }
};

// Obtener atrasos del día
exports.getAtrasosDelDia = async (req, res) => {
    const { fecha } = req.query;

    if (!fecha) {
        return res.status(400).json({ error: 'Se requiere una fecha' });
    }

    const inicioDelDia = new Date(`${fecha}T00:00:00`);
    const finDelDia = new Date(`${fecha}T23:59:59`);

    const query = `
        SELECT a.rut_alumno, a.fecha_atrasos, a.justificativo, a.tipo_justificativo, 
               CONCAT(b.nombre_alumno, ' ', b.segundo_nombre_alumno, ' ', b.apellido_paterno_alumno, ' ', b.apellido_materno_alumno) AS nombre_completo, 
               c.nombre_curso
        FROM atrasos a
        JOIN alumnos b ON a.rut_alumno = b.rut_alumno
        JOIN cursos c ON b.cod_curso = c.cod_curso
        WHERE a.fecha_atrasos BETWEEN $1 AND $2
    `;

    try {
        const result = await pool.query(query, [inicioDelDia, finDelDia]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en la consulta SQL:', error);
        return res.status(500).json({ error: 'Error al obtener los atrasos' });
    }
};

// Obtener atrasos en un rango de fechas con el tipo de justificativo
exports.getAtrasosRango = async (req, res) => {
    const { startDate, endDate } = req.query;

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
            a.rut_alumno,
            a.fecha_atrasos,
            CASE
                WHEN b.justificativo_residencia = true THEN 'Residencia'
                WHEN b.justificativo_medico = true THEN 'Médico'
                WHEN b.justificativo_deportivo = true THEN 'Deportivo'
                ELSE 'Sin justificativo'
            END AS tipo_justificativo,
            CONCAT(b.nombre_alumno, ' ', b.segundo_nombre_alumno, ' ', b.apellido_paterno_alumno, ' ', b.apellido_materno_alumno) AS nombre_completo,
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
            a.fecha_atrasos ASC
    `;

    try {
        const result = await pool.query(query, [start, end]);
        res.status(200).json({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            atrasos: result.rows
        });
    } catch (error) {
        console.error('Error en la consulta de atrasos por rango:', error);
        return res.status(500).json({ error: 'Error al obtener los atrasos por rango' });
    }
};

// Verificar si existe un RUT
exports.verificarRut = async (req, res) => {
    const { rut } = req.params;

    if (!rut) {
        return res.status(400).json({ error: 'RUT no proporcionado' });
    }

    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM alumnos WHERE rut_alumno = $1', [rut]);
        const exists = parseInt(result.rows[0].count) > 0;
        res.json({ exists });
    } catch (error) {
        console.error('Error al verificar RUT:', error);
        return res.status(500).json({ error: 'Error al verificar el RUT' });
    }
};