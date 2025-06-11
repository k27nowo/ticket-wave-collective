
import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitizeInput = {
  text: (input: string): string => {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [] 
    }).trim();
  },
  
  html: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: []
    });
  },
  
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      return url.toString();
    } catch {
      return '';
    }
  }
};

// Validation utilities
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain uppercase, lowercase, and numbers' };
    }
    return { isValid: true, message: '' };
  },
  
  eventTitle: (title: string): boolean => {
    return title.trim().length >= 3 && title.trim().length <= 100;
  },
  
  eventDate: (date: string): boolean => {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate > now;
  },
  
  price: (price: number): boolean => {
    return price >= 0 && price <= 10000;
  },
  
  quantity: (quantity: number): boolean => {
    return Number.isInteger(quantity) && quantity > 0 && quantity <= 10000;
  }
};

// Rate limiting utility (simple client-side implementation)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Security headers utility for client-side
export const securityUtils = {
  // Generate a simple CSRF token (for client-side use)
  generateCSRFToken: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },
  
  // Validate CSRF token format
  isValidCSRFToken: (token: string): boolean => {
    return /^[a-z0-9]{20,}$/.test(token);
  },
  
  // Log security events
  logSecurityEvent: async (event: string, details: any) => {
    console.warn('Security Event:', event, details);
    // In production, this would send to a security monitoring service
  }
};
