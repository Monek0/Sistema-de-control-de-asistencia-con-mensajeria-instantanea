const express = require('express');
const router = express.Router();
const alumnosController = require('../controllers/alumnosController');

// Obtener todos los alumnos
router.get('/', alumnosController.getAlumnos);

// Crear un nuevo alumno
router.post('/', alumnosController.createAlumno);

// Actualizar un alumno existente
router.put('/:rut_alumno', alumnosController.updateAlumno);

module.exports = router;
