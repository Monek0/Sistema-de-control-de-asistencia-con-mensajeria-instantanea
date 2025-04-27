const pool = require('../config/db');

exports.getDailyCount = async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY‑MM‑DD
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS count
     FROM atrasos
     WHERE DATE(fecha_atrasos) = $1`,
    [today]
  );
  res.json({ date: today, count: parseInt(rows[0].count, 10) });
};

exports.getWeeklyCount = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT to_char(fecha_atrasos, 'IYYY-IW') AS week, COUNT(*) AS count
     FROM atrasos
     WHERE fecha_atrasos >= NOW() - INTERVAL '7 days'
     GROUP BY week
     ORDER BY week`
  );
  res.json(rows.map(r => ({ week: r.week, count: parseInt(r.count, 10) })));
};

exports.getMonthlyTrend = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT to_char(fecha_atrasos, 'DD') AS day, COUNT(*) AS count
     FROM atrasos
     WHERE fecha_atrasos >= date_trunc('month', NOW())
     GROUP BY day
     ORDER BY day`
  );
  res.json(rows.map(r => ({ day: r.day, count: parseInt(r.count, 10) })));
};

exports.getTopUsers = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT rut_alumno, COUNT(*) AS count
     FROM atrasos
     WHERE fecha_atrasos >= NOW() - INTERVAL '30 days'
     GROUP BY rut_alumno
     ORDER BY count DESC
     LIMIT 5`
  );
  res.json(rows);
};

exports.getJustifiedVsNot = async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE justificativo = true)   AS justified,
           COUNT(*) FILTER (WHERE justificativo = false)  AS not
         FROM atrasos`
      );
      const { justified, not } = rows[0];
      res.json({ justified: parseInt(justified, 10), not: parseInt(not, 10) });
    } catch (err) {
      console.error('Error en getJustifiedVsNot:', err);
      res.status(500).json({ message: 'Error al obtener justificados vs no justificados' });
    }
  };

  