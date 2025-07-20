const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursosController');

router.get('/', cursosController.getCursos);

module.exports = router;
