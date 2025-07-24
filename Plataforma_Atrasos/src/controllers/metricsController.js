const { getClient } = require('../config/db');

exports.getDailyCount = async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY‑MM‑DD
  let client;
  
  try {
    client = await getClient();
    const { rows } = await client.query(
      `SELECT COUNT(*) AS count
       FROM atrasos
       WHERE DATE(fecha_atrasos) = $1`,
      [today]
    );
    res.json({ date: today, count: parseInt(rows[0].count, 10) });
  } catch (error) {
    console.error('Error en getDailyCount:', error);
    res.status(500).json({ message: 'Error al obtener conteo diario' });
  } finally {
    if (client) client.release();
  }
};

exports.getWeeklyCount = async (req, res) => {
  let client;
  
  try {
    client = await getClient();
    const { rows } = await client.query(
      `SELECT to_char(fecha_atrasos, 'IYYY-IW') AS week, COUNT(*) AS count
       FROM atrasos
       WHERE fecha_atrasos >= NOW() - INTERVAL '7 days'
       GROUP BY week
       ORDER BY week`
    );
    res.json(rows.map(r => ({ week: r.week, count: parseInt(r.count, 10) })));
  } catch (error) {
    console.error('Error en getWeeklyCount:', error);
    res.status(500).json({ message: 'Error al obtener conteo semanal' });
  } finally {
    if (client) client.release();
  }
};

exports.getMonthlyTrend = async (req, res) => {
  let client;
  
  try {
    client = await getClient();
    const { rows } = await client.query(
      `SELECT to_char(fecha_atrasos, 'DD') AS day, COUNT(*) AS count
       FROM atrasos
       WHERE fecha_atrasos >= date_trunc('month', NOW())
       GROUP BY day
       ORDER BY day`
    );
    res.json(rows.map(r => ({ day: r.day, count: parseInt(r.count, 10) })));
  } catch (error) {
    console.error('Error en getMonthlyTrend:', error);
    res.status(500).json({ message: 'Error al obtener tendencia mensual' });
  } finally {
    if (client) client.release();
  }
};

exports.getTopUsers = async (req, res) => {
  let client;
  
  try {
    client = await getClient();
    const { rows } = await client.query(
      `SELECT rut_alumno, COUNT(*) AS count
       FROM atrasos
       WHERE fecha_atrasos >= NOW() - INTERVAL '30 days'
       GROUP BY rut_alumno
       ORDER BY count DESC
       LIMIT 15`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en getTopUsers:', error);
    res.status(500).json({ message: 'Error al obtener usuarios top' });
  } finally {
    if (client) client.release();
  }
};

exports.getJustifiedVsNot = async (req, res) => {
  let client;
  
  try {
    client = await getClient();
    const { rows } = await client.query(
      `SELECT
         COUNT(*) FILTER (WHERE justificativo = true)   AS justified,
         COUNT(*) FILTER (WHERE justificativo = false)  AS not
       FROM atrasos`
    );
    const { justified, not } = rows[0];
    res.json({ justified: parseInt(justified, 10), not: parseInt(not, 10) });
  } catch (error) {
    console.error('Error en getJustifiedVsNot:', error);
    res.status(500).json({ message: 'Error al obtener justificados vs no justificados' });
  } finally {
    if (client) client.release();
  }
};

const getDateRange = (type) => {
  const now = new Date();
  let from;
  switch (type) {
    case 'diario':
      from = now.toISOString().split('T')[0];
      return [`DATE(fecha_atrasos) = '${from}'`];
    case 'semanal':
      return [`fecha_atrasos >= NOW() - INTERVAL '7 days'`];
    case 'mensual':
      return [`fecha_atrasos >= date_trunc('month', NOW())`];
    case 'anual':
      return [`fecha_atrasos >= date_trunc('year', NOW())`];
    default:
      throw new Error('Tipo de reporte inválido');
  }
};

exports.getLevels = async (req, res) => {
  const { type } = req.params;
  const { curso, alumno } = req.query;

  let client;
  try {
    const conditions = getDateRange(type);
    if (curso) conditions.push(`c.nombre_curso = '${curso}'`);
    if (alumno) conditions.push(`al.nombre_alumno ILIKE '%${alumno}%'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    client = await getClient();
    const { rows } = await client.query(
      `SELECT 
          CASE WHEN a.justificado = true THEN 'Justificado' ELSE 'No Justificado' END AS estado,
          COUNT(*) AS cantidad
       FROM atrasos a
       JOIN alumnos al ON a.rut_alumno = al.rut_alumno
       JOIN cursos c ON al.cod_curso = c.cod_curso
       ${whereClause}
       GROUP BY estado
       ORDER BY estado`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener justificados vs no justificados' });
  } finally {
    if (client) client.release();
  }
};


exports.getTopStudents = async (req, res) => {
  const { type } = req.params;
  const { curso, alumno } = req.query;

  let client;
  try {
    const conditions = getDateRange(type);
    if (curso) conditions.push(`c.nombre_curso = '${curso}'`);
    if (alumno) conditions.push(`al.nombre_alumno ILIKE '%${alumno}%'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    client = await getClient();
    const { rows } = await client.query(
      `SELECT al.nombre_alumno AS nombre, COUNT(*) AS cantidad
       FROM atrasos a
       JOIN alumnos al ON a.rut_alumno = al.rut_alumno
       JOIN cursos c ON al.cod_curso = c.cod_curso
       ${whereClause}
       GROUP BY al.nombre_alumno
       ORDER BY cantidad DESC
       LIMIT 15`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener top estudiantes' });
  } finally {
    if (client) client.release();
  }
};

exports.getTopCourses = async (req, res) => {
  const { type } = req.params;
  const { curso, alumno } = req.query;

  let client;
  try {
    const conditions = getDateRange(type);
    if (curso) conditions.push(`c.nombre_curso = '${curso}'`);
    if (alumno) conditions.push(`al.nombre_alumno ILIKE '%${alumno}%'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    client = await getClient();
    const { rows } = await client.query(
      `SELECT c.nombre_curso AS curso, COUNT(*) AS cantidad
       FROM atrasos a
       JOIN alumnos al ON a.rut_alumno = al.rut_alumno
       JOIN cursos c ON al.cod_curso = c.cod_curso
       ${whereClause}
       GROUP BY c.nombre_curso
       ORDER BY cantidad DESC
       LIMIT 15`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener top cursos' });
  } finally {
    if (client) client.release();
  }
};