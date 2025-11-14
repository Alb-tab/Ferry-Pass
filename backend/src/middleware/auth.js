import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.operator = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export function requireRole(required) {
  // required: string or array
  return (req, res, next) => {
    const role = req.operator?.role;
    if (!role) return res.status(403).json({ error: 'Papel não encontrado no token' });
    const allowed = Array.isArray(required) ? required : [required];
    if (!allowed.includes(role)) return res.status(403).json({ error: 'Permissão negada' });
    next();
  };
}

export function optionalToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.operator = decoded;
    } catch (err) {
      // Token inválido, mas não é obrigatório
    }
  }
  next();
}
