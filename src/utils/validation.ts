import { NextRequest } from 'next/server';

// Input sanitization
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateProductData(data: {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  brand?: string;
  stock?: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Product name is required');
  } else if (data.name.length > 100) {
    errors.push('Product name cannot exceed 100 characters');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Product description is required');
  } else if (data.description.length > 1000) {
    errors.push('Product description cannot exceed 1000 characters');
  }

  if (data.price === undefined || data.price === null) {
    errors.push('Product price is required');
  } else if (data.price < 0) {
    errors.push('Product price must be positive');
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push('Product category is required');
  }

  if (!data.brand || data.brand.trim().length === 0) {
    errors.push('Product brand is required');
  }

  if (data.stock === undefined || data.stock === null) {
    errors.push('Product stock is required');
  } else if (data.stock < 0) {
    errors.push('Product stock cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateOrderData(data: {
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.shippingAddress) {
    errors.push('Shipping address is required');
    return { isValid: false, errors };
  }

  const { street, city, state, zipCode, country } = data.shippingAddress;

  if (!street || street.trim().length === 0) {
    errors.push('Street address is required');
  }

  if (!city || city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!state || state.trim().length === 0) {
    errors.push('State is required');
  }

  if (!zipCode || zipCode.trim().length === 0) {
    errors.push('ZIP code is required');
  }

  if (!country || country.trim().length === 0) {
    errors.push('Country is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Rate limiting helper
export function isRateLimited(
  request: NextRequest,
  limits: { maxRequests: number; windowMs: number }
): boolean {
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  // Simple in-memory rate limiting (use Redis in production)
  const now = Date.now();
  const windowStart = now - limits.windowMs;

  // This is a simplified version - in production, use a proper rate limiter
  return false; // Placeholder - implement proper rate limiting
}

// SQL injection prevention (for NoSQL, focus on input validation)
export function validateObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}