import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth_token';

export interface AuthUser {
  _id: string;
  email: string;
  name?: string;
  role: string;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
}

export function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return {
      _id: decoded.userId,
      role: decoded.role,
      email: '', // Will be populated from database
      name: ''
    };
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const token = getAuthToken(request);
  if (!token) return null;
  return verifyToken(token);
}