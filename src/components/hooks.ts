"use client";

import { useEffect, useMemo, useState } from 'react';
import { User } from './types';

export function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, targetDate.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { diff, days, hours, minutes, seconds };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for user data in localStorage (for backward compatibility)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Try to get user from API (checks httpOnly cookie)
          const response = await fetch('/api/auth/profile');
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            // Update localStorage for client-side access
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return user;
}