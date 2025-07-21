const express = require('express');
const path = require('path');
const router = express.Router();
const atrasosController = require('../controllers/atrasosController');

// Obtener todos los atrasos
router.get('/atrasos', atrasosController.getAllAtrasos);

// Ruta para obtener atrasos en un rango específico
router.get('/atrasos/rango', atrasosController.getAtrasosRango);

// Ruta para verificar si existe el RUT
router.get('/alumnos/verificar/:rut', atrasosController.verificarRut);

// Ruta para obtener los atrasos del día (debe ir antes de la ruta con :id)
router.get('/atrasos/dia', atrasosController.getAtrasosDelDia);

// Registrar un nuevo atraso
router.post('/atrasos', atrasosController.createAtraso);

// Actualizar un atraso existente
router.put('/atrasos/:id', atrasosController.updateAtraso);

// Eliminar un atraso
router.delete('/atrasos/:id', atrasosController.deleteAtraso);

router.put('/atrasos/:id', async (req, res) => {
  const { justificado } = req.body;
  await db.query('UPDATE atrasos SET justificado = ? WHERE cod_atrasos = ?', [justificado, req.params.id]);
  res.sendStatus(200);
});


// Baucher
//router.get('/generatePDF/:codAtraso', atrasosController.generatePDFForAtraso);

// Nueva ruta para descargar el PDF de los atrasos
router.get('/SalidaPDF/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../SalidaPDF', req.params.filename);
    res.download(filePath); // Esto inicia la descarga del archivo
});

module.exports = router;