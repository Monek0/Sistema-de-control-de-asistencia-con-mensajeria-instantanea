const express = require('express');
const {
  getDailyCount,
  getWeeklyCount,
  getMonthlyTrend,
  getAnnualCount,
  getTopUsers,
  getJustifiedVsNot,
  getLevels, 
  getTopStudents, 
  getTopCourses
} = require('../controllers/metricsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authMiddleware()); 

router.get('/daily', getDailyCount);
router.get('/weekly', getWeeklyCount);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/anual', getAnnualCount);
router.get('/top-users', getTopUsers);
router.get('/justified-vs-not', getJustifiedVsNot);
router.get('/:type/levels', getLevels);
router.get('/:type/top-students', getTopStudents);
router.get('/:type/top-courses', getTopCourses);



module.exports = router;
