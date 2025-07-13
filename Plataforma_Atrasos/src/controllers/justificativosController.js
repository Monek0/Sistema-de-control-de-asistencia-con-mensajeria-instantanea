const { getClient } = require('../config/db');

// Verificar justificativo de residencia de un alumno y devolver su nombre
exports.verificarJustificativos = async (req, res) => {
    const { rut } = req.params;
    const query = 'SELECT nombre_alumno, justificativo_residencia, justificativo_deportivo, justificativo_medico FROM alumnos WHERE rut_alumno = $1';
    let client;

    try {
        client = await getClient();
        const result = await client.query(query, [rut]);
        
        if (result.rows.length > 0) {
            return res.status(200).json({
                justificativo_residencia: result.rows[0].justificativo_residencia,
                justificativo_deportivo: result.rows[0].justificativo_deportivo,
                justificativo_medico: result.rows[0].justificativo_medico,
                nombre_alumno: result.rows[0].nombre_alumno
            });
        } else {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
    } catch (error) {
        console.error('Error al consultar justificativos:', error);
        return res.status(500).json({ error: 'Error al consultar justificativos' });
    } finally {
        if (client) client.release();
    }
};