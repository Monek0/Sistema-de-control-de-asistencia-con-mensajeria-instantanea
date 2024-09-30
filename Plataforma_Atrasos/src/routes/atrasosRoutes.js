const express = require('express');
const router = express.Router();
const atrasosController = require('../controllers/atrasosController');


// Obtener todos los atrasos
router.get('/atrasos', atrasosController.getAllAtrasos);

// Registrar un nuevo atraso
router.post('/atrasos', atrasosController.createAtraso);

// Actualizar un atraso existente
router.put('/atrasos/:id', atrasosController.updateAtraso);

// Eliminar un atraso
router.delete('/atrasos/:id', atrasosController.deleteAtraso);


module.exports = router;
