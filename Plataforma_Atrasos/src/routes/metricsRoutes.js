const express = require('express');
const {
  getDailyCount,
  getWeeklyCount,
  getMonthlyTrend,
  getTopUsers,
  getJustifiedVsNot
} = require('../controllers/metricsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authMiddleware()); 

router.get('/daily', getDailyCount);
router.get('/weekly', getWeeklyCount);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/top-users', getTopUsers);
router.get('/justified-vs-not', getJustifiedVsNot);


module.exports = router;
