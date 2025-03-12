const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

exports.login = async (req, res) => {
    const { rutUsername, contraseña } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE rut_username = $1', [rutUsername]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(contraseña, user.contraseña);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.rut_username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Error de base de datos:', err);
        return res.status(500).json({ message: 'Error en la base de datos' });
    }
};

exports.register = async (req, res) => {
    const { nombreUsuario, codRol, contraseña, rutUsername } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        
        await pool.query(
            'INSERT INTO usuarios (nombre_usuario, cod_rol, contraseña, rut_username) VALUES ($1, $2, $3, $4)',
            [nombreUsuario, codRol, hashedPassword, rutUsername]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (err) {
        console.error('Error al registrar el usuario:', err);
        return res.status(500).json({ message: 'Error al registrar el usuario' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ message: 'Error en la base de datos' });
    }
};

exports.getUsersByRut = async (req, res) => {
    const { rutUsername } = req.params;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE rut_username = $1', [rutUsername]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ message: 'Error en la base de datos' });
    }
};

exports.deleteUser = async (req, res) => {
    const { codUsuario } = req.params;

    try {
        await pool.query('DELETE FROM usuarios WHERE cod_usuario = $1', [codUsuario]);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar el usuario:', err);
        return res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
};

exports.getUserNameByRUT = async (req, res) => {
    const { rutUsername } = req.params;

    try {
        const result = await pool.query('SELECT nombre_usuario FROM usuarios WHERE rut_username = $1', [rutUsername]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ message: 'Error en la base de datos' });
    }
};