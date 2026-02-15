import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function verifyAuth(request) {
  try {
    const token = request.cookies.get('user-token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return null;
    }
    const decoded = verifyToken(token);
    return decoded;
  } catch {
    return null;
  }
}
