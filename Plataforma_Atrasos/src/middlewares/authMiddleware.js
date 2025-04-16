const jwt = require('jsonwebtoken');

const verifyTokenAndRole = (allowedRoles = []) => {
  return (req, res, next) => {
    // Extraer token del header Authorization en formato "Bearer <token>"
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado, se requiere autenticación.' });
    }

    try {
      // Verificar y decodificar el token usando la clave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;

      // Si se han definido roles permitidos, se verifica que el rol del usuario esté en ese arreglo
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso.' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
  };
};

module.exports = verifyTokenAndRole;
