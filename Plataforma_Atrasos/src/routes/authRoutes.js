const express = require('express');
const { login, register, getAllUsers, getUsersByRut, deleteUser, getUserNameByRUT } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/users', authMiddleware, getAllUsers);
router.get('/users/:rutUsername', authMiddleware, getUsersByRut);
router.get('/username/:rutUsername', getUserNameByRUT);
router.delete('/users/:codUsuario', authMiddleware, deleteUser);

module.exports = router;