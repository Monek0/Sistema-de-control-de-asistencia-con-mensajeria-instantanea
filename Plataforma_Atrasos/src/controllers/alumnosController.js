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
    const { nombre_alumno, cod_curso, n_celular_apoderado, correo_alumno, apoderado } = req.body;

    const alumnoResult = await client.query(
      `SELECT * FROM alumnos WHERE rut_alumno = $1`,
      [rut_alumno]
    );

    if (alumnoResult.rowCount === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    const result = await client.query(`
      UPDATE alumnos 
      SET nombre_alumno = $1,
          cod_curso = $2,
          n_celular_apoderado = $3,
          correo_alumno = $4,
          apoderado = $5
      WHERE rut_alumno = $6
      RETURNING *
    `, [nombre_alumno, cod_curso, n_celular_apoderado, correo_alumno, apoderado, rut_alumno]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar alumno:', error);
    res.status(500).json({ error: 'Error al actualizar alumno' });
  } finally {
    client.release();
  }
};