const { getClient } = require('../config/db');

// Obtener todos los alumnos
exports.getAlumnos = async (req, res) => {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT 
        rut_alumno,
        nombre_alumno,
        cod_curso,
        n_celular_apoderado,
        correo_alumno,
        apoderado
      FROM alumnos
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  } finally {
    client.release();
  }
};

// Crear un nuevo alumno
exports.createAlumno = async (req, res) => {
  const client = await getClient();
  try {
    const { rut_alumno, nombre_alumno, cod_curso, n_celular_apoderado, correo_alumno, apoderado } = req.body;

    //  Validar campos requeridos
    if (!rut_alumno || !nombre_alumno) {
      return res.status(400).json({ error: 'rut_alumno y nombre_alumno son obligatorios' });
    }

    //  Verificar si ya existe el rut
    const existing = await client.query(
      `SELECT 1 FROM alumnos WHERE rut_alumno = $1`,
      [rut_alumno]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'El rut_alumno ya está registrado' });
    }

    //  Permitir null para campos opcionales
    const result = await client.query(`
      INSERT INTO alumnos 
        (rut_alumno, nombre_alumno, cod_curso, n_celular_apoderado, correo_alumno, apoderado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      rut_alumno,
      nombre_alumno,
      cod_curso || null,
      n_celular_apoderado || null,
      correo_alumno || null,
      apoderado || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear alumno:', error);
    res.status(500).json({ error: 'Error al crear alumno' });
  } finally {
    client.release();
  }
};

// Actualizar un alumno existente
exports.updateAlumno = async (req, res) => {
  const client = await getClient();
  try {
    const { rut_alumno } = req.params;
    const { nuevo_rut, nombre_alumno, cod_curso, n_celular_apoderado, correo_alumno, apoderado } = req.body;

    const alumnoResult = await client.query(
      `SELECT * FROM alumnos WHERE rut_alumno = $1`,
      [rut_alumno]
    );

    if (alumnoResult.rowCount === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    const result = await client.query(`
      UPDATE alumnos 
      SET rut_alumno = $1,
          nombre_alumno = $2,
          cod_curso = $3,
          n_celular_apoderado = $4,
          correo_alumno = $5,
          apoderado = $6
      WHERE rut_alumno = $7
      RETURNING *
    `, [nuevo_rut || rut_alumno, nombre_alumno, cod_curso, n_celular_apoderado, correo_alumno, apoderado, rut_alumno]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar alumno:', error);
    res.status(500).json({ error: 'Error al actualizar alumno' });
  } finally {
    client.release();
  }
};