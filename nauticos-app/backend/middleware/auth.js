const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'nauticos-secret-2024';

function authMiddleware(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token mancante.' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token non valido.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.ruolo)) return res.status(403).json({ error: 'Permessi insufficienti.' });
    next();
  };
}

module.exports = { authMiddleware, requireRole };
