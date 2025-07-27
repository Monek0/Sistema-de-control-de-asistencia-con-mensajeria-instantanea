const { getClient } = require('../config/db');

exports.getDailyCount = async (req, res) => {
  const fecha = req.query.fecha
    ? req.query.fecha
    : new Date().toISOString().split('T')[0];
  let client;
  try {
    client = await getClient();
    const { rows } = await client.query(
      `SELECT COUNT(*) AS count
       FROM atrasos
       WHERE DATE(fecha_atrasos) = $1`,
      [fecha]
    );
    res.json({ date: fecha, count: parseInt(rows[0].count, 10) });
  } catch (error) {
    console.error('Error en getDailyCount:', error);
    res.status(500).json({ message: 'Error al obtener conteo diario' });
  } finally {
    if (client) client.release();
  }
};

exports.getWeeklyCount = async (req, res) => {
  const { desde, hasta } = req.query;
  let client;
  try {
    client = await getClient();

    let where = '';
    let params = [];
    if (desde && hasta) {
      where  = `WHERE fecha_atrasos BETWEEN $1 AND $2`;
      params = [desde, hasta];
    } else {
      where = `WHERE fecha_atrasos >= NOW() - INTERVAL '7 days'`;
    }

    const { rows } = await client.query(
      `SELECT to_char(fecha_atrasos, 'IYYY-IW') AS week, COUNT(*) AS count
       FROM atrasos
       ${where}
       GROUP BY week
       ORDER BY week`,
      params
    );
    res.json(rows.map(r => ({ week: r.week, count: parseInt(r.count, 10) })));
  } catch (error) {
    console.error('Error en getWeeklyCount:', error);
    res.status(500).json({ message: 'Error al obtener conteo semanal' });
  } finally {
    if (client) client.release();
  }
};

// Tendencia mensual dinámica: acepta ?desde=YYYY‑MM‑DD&hasta=YYYY‑MM‑DD
exports.getMonthlyTrend = async (req, res) => {
  const { desde, hasta } = req.query;
  let client;
  try {
    client = await getClient();

    let where = '';
    let params = [];
    if (desde && hasta) {
      where  = `WHERE fecha_atrasos BETWEEN $1 AND $2`;
      params = [desde, hasta];
    } else {
      where = `WHERE fecha_atrasos >= date_trunc('month', NOW())`;
    }

    const { rows } = await client.query(
      `SELECT to_char(fecha_atrasos, 'DD') AS day, COUNT(*) AS count
       FROM atrasos
       ${where}
       GROUP BY day
       ORDER BY day`,
      params
    );
    res.json(rows.map(r => ({ day: r.day, count: parseInt(r.count, 10) })));
  } catch (error) {
    console.error('Error en getMonthlyTrend:', error);
    res.status(500).json({ message: 'Error al obtener tendencia mensual' });
  } finally {
    if (client) client.release();
  }
};

// Nuevo: Conteo Anual dinámico: acepta ?desde=YYYY‑MM‑DD&hasta=YYYY‑MM‑DD
exports.getAnnualCount = async (req, res) => {
  const { desde, hasta } = req.query;
  let client;
  try {
    client = await getClient();

    let where = '';
    let params = [];
    if (desde && hasta) {
      where  = `WHERE fecha_atrasos BETWEEN $1 AND $2`;
      params = [desde, hasta];
    } else {
      where = `WHERE fecha_atrasos >= date_trunc('year', NOW())`;
    }

    const { rows } = await client.query(
      `SELECT COUNT(*) AS count
       FROM atrasos
       ${where}`,
      params
    );
    res.json({ count: parseInt(rows[0].count, 10) });
  } catch (error) {
    console.error('Error en getAnnualCount:', error);
    res.status(500).json({ message: 'Error al obtener conteo anual' });
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
  switch (type) {
    case 'diario':
      // Si no vienen fechas, usamos hoy
      const today = now.toISOString().split('T')[0];
      return [`DATE(fecha_atrasos) = '${today}'`];
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
  const { curso, alumno, fecha, desde, hasta } = req.query;

  let client;
  try {
    // 1) determinar condición de fecha
    let conditions = [];
    if (fecha) {
      conditions.push(`DATE(fecha_atrasos) = '${fecha}'`);
    } else if (desde && hasta) {
      conditions.push(`fecha_atrasos >= '${desde}'`);
      conditions.push(`fecha_atrasos <= '${hasta}'`);
    } else {
      conditions = getDateRange(type);
    }

    // 2) agregar filtros de curso y alumno
    if (curso)   conditions.push(`c.nombre_curso = '${curso}'`);
    if (alumno)  conditions.push(`al.nombre_alumno ILIKE '%${alumno}%'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // 3) consulta
    client = await getClient();
    const { rows } = await client.query(
      `SELECT
         CASE WHEN a.justificado THEN 'Justificado' ELSE 'No Justificado' END AS estado,
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
    console.error('Error en getLevels:', err);
    res.status(500).json({ message: 'Error al obtener estados' });
  } finally {
    if (client) client.release();
  }
};


// GET /api/metrics/:type/top-students
exports.getTopStudents = async (req, res) => {
  const { type } = req.params;
  const { curso, alumno, fecha, desde, hasta } = req.query;

  let client;
  try {
    let conditions = [];
    if (fecha) {
      conditions.push(`DATE(a.fecha_atrasos) = '${fecha}'`);
    } else if (desde && hasta) {
      conditions.push(`a.fecha_atrasos >= '${desde}'`);
      conditions.push(`a.fecha_atrasos <= '${hasta}'`);
    } else {
      conditions = getDateRange(type);
    }
    if (curso)   conditions.push(`c.nombre_curso = '${curso}'`);
    if (alumno)  conditions.push(`al.nombre_alumno ILIKE '%${alumno}%'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    client = await getClient();
    const { rows } = await client.query(
      `SELECT
         al.nombre_alumno AS nombre,
         COUNT(*) AS cantidad
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
    console.error('Error en getTopStudents:', err);
    res.status(500).json({ message: 'Error al obtener top estudiantes' });
  } finally {
    if (client) client.release();
  }
};

// GET /api/metrics/:type/top-courses
exports.getTopCourses = async (req, res) => {
  const { type } = req.params;
  const { curso, alumno, fecha, desde, hasta } = req.query;

  let client;
  try {
    let conditions = [];
    if (fecha) {
      conditions.push(`DATE(a.fecha_atrasos) = '${fecha}'`);
    } else if (desde && hasta) {
      conditions.push(`a.fecha_atrasos >= '${desde}'`);
      conditions.push(`a.fecha_atrasos <= '${hasta}'`);
    } else {
      conditions = getDateRange(type);
    }
    if (curso)   conditions.push(`c.nombre_curso = '${curso}'`);
    if (alumno)  conditions.push(`al.nombre_alumno ILIKE '%${alumno}%'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    client = await getClient();
    const { rows } = await client.query(
      `SELECT
         c.nombre_curso AS curso,
         COUNT(*) AS cantidad
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
    console.error('Error en getTopCourses:', err);
    res.status(500).json({ message: 'Error al obtener top cursos' });
  } finally {
    if (client) client.release();
  }
};
