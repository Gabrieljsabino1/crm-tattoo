import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const SECRET = process.env.JWT_SECRET || 'crm_tattoo_jwt_secret_dev_2026';

export function generateToken(userId, role) {
  return jwt.sign({ id: userId, role }, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export function getAuthUser(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(request) {
  const user = getAuthUser(request);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Token não fornecido ou expirado.' }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export function requireAdmin(request) {
  const { user, error } = requireAuth(request);
  if (error) return { user: null, error };
  if (user.role !== 'ADMIN') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export async function fileToDataUrl(file) {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mime = file.type || 'image/jpeg';
  return `data:${mime};base64,${base64}`;
}
