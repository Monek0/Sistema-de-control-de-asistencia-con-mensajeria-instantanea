const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getClient } = require('../config/db');

exports.login = async (req, res) => {
    const { rutUsername, contrasena } = req.body;
    let client;

    console.log(rutUsername, contrasena);

    try {
        client = await getClient();
        const result = await client.query('SELECT * FROM usuarios WHERE rut_username = $1', [rutUsername]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(contrasena, user.contrasena);

        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.rut_username, role: user.cod_rol }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, role: user.cod_rol });
    } catch (err) {
        console.error('Error de base de datos:', err);
        return res.status(500).json({ message: 'Error en la base de datos' });
    } finally {
        if (client) client.release();
    }
};

exports.register = async (req, res) => {
    const { nombreUsuario, codRol, contrasena, rutUsername } = req.body;
    let client;

    try {
        client = await getClient();
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        await client.query(
            'INSERT INTO usuarios (nombre_usuario, cod_rol, contrasena, rut_username) VALUES ($1, $2, $3, $4)',
            [nombreUsuario, codRol, hashedPassword, rutUsername]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (err) {
        console.error('Error al registrar el usuario:', err);
        return res.status(500).json({ message: 'Error al registrar el usuario' });
    } finally {
        if (client) client.release();
    }
};

exports.getAllUsers = async (req, res) => {
    let client;

    try {
        client = await getClient();
        const result = await client.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ message: 'Error en la base de datos' });
    } finally {
        if (client) client.release();
    }
};

exports.getUsersByRut = async (req, res) => {
    const { rutUsername } = req.params;
    let client;

    try {
        client = await getClient();
        const result = await client.query('SELECT * FROM usuarios WHERE rut_username = $1', [rutUsername]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ message: 'Error en la base de datos' });
    } finally {
        if (client) client.release();
    }
};

exports.deleteUser = async (req, res) => {
    const { codUsuario } = req.params;
    let client;

    try {
        client = await getClient();
        await client.query('DELETE FROM usuarios WHERE cod_usuario = $1', [codUsuario]);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar el usuario:', err);
        return res.status(500).json({ message: 'Error al eliminar el usuario' });
    } finally {
        if (client) client.release();
    }
};

exports.getUserNameByRUT = async (req, res) => {
    const { rutUsername } = req.params;
    let client;

    try {
        client = await getClient();
        const result = await client.query('SELECT nombre_usuario FROM usuarios WHERE rut_username = $1', [rutUsername]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]); // { nombre_usuario: '...' }
    } catch (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ message: 'Error en la base de datos' });
    } finally {
        if (client) client.release();
    }
};