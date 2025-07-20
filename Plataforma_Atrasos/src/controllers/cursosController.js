const { getClient } = require('../config/db');

// Obtener todos los cursos
exports.getCursos = async (req, res) => {
  let client;
  try {
    client = await getClient();

    const result = await client.query(`
      SELECT cod_curso, nombre_curso
      FROM cursos
      ORDER BY cod_curso ASC
    `);

    const cursos = result.rows.map(curso => ({
      cod_curso: curso.cod_curso,
      nombre_curso: curso.nombre_curso
    }));

    res.json(cursos);
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  } finally {
    if (client) client.release();
  }
};
