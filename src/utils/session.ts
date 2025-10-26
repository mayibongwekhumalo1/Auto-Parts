import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

interface CartItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Simple session management for guest carts (in production, use Redis)
const sessions = new Map<string, { cart: CartItem[]; expires: number }>();

const SESSION_COOKIE_NAME = 'guest_session';
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getSessionId(request: NextRequest): string {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  return cookie?.value || '';
}

export function createSessionId(): string {
  return randomBytes(32).toString('hex');
}

export function getGuestCart(sessionId: string): CartItem[] {
  const session = sessions.get(sessionId);
  if (!session || Date.now() > session.expires) {
    sessions.delete(sessionId);
    return [];
  }
  return session.cart || [];
}

export function setGuestCart(sessionId: string, cart: CartItem[]): void {
  sessions.set(sessionId, {
    cart,
    expires: Date.now() + SESSION_TTL
  });
}

export function clearGuestCart(sessionId: string): void {
  sessions.delete(sessionId);
}

export function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL / 1000
  });
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expires) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour