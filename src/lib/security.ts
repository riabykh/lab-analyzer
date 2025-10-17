// Use Web Crypto API for Edge Runtime compatibility

// Enhanced rate limiting with Redis-like functionality (in-memory for now)
interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
  attempts: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private blockDuration: number;

  constructor(windowMs = 60000, maxRequests = 10, blockDuration = 300000) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.blockDuration = blockDuration;
  }

  async check(identifier: string): Promise<{ success: boolean; remainingRequests?: number; resetTime?: number }> {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Clean up expired blocks
    if (record?.blocked && record.resetTime < now) {
      record.blocked = false;
      record.count = 0;
      record.attempts = [];
    }

    // If currently blocked
    if (record?.blocked) {
      return { 
        success: false, 
        resetTime: record.resetTime 
      };
    }

    // Initialize or reset if window expired
    if (!record || record.resetTime < now) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
        blocked: false,
        attempts: [now]
      });
      return { 
        success: true, 
        remainingRequests: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }

    // Filter recent attempts within window
    const recentAttempts = record.attempts.filter(time => time > (now - this.windowMs));
    record.attempts = [...recentAttempts, now];
    record.count = recentAttempts.length + 1;

    // Check if limit exceeded
    if (record.count > this.maxRequests) {
      record.blocked = true;
      record.resetTime = now + this.blockDuration;
      
      rateLimitStore.set(identifier, record);
      return { success: false, resetTime: record.resetTime };
    }

    rateLimitStore.set(identifier, record);
    return { 
      success: true, 
      remainingRequests: this.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  // Get current status without incrementing
  async status(identifier: string): Promise<{ requests: number; resetTime: number; blocked: boolean }> {
    const record = rateLimitStore.get(identifier);
    const now = Date.now();

    if (!record || record.resetTime < now) {
      return { requests: 0, resetTime: now + this.windowMs, blocked: false };
    }

    return {
      requests: record.count,
      resetTime: record.resetTime,
      blocked: record.blocked && record.resetTime > now
    };
  }
}

// Request signature verification
export function generateRequestSignature(
  body: string, 
  timestamp: string, 
  secret: string
): string {
  const payload = `${timestamp}.${body}`;
  
  // Simplified signature generation for Edge Runtime compatibility
  // In production, use proper HMAC with Web Crypto API
  const combined = secret + payload;
  
  // Basic hash simulation - replace with proper Web Crypto API implementation
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

export function verifyRequestSignature(
  body: string,
  timestamp: string,
  signature: string,
  secret: string,
  toleranceMs = 300000 // 5 minutes
): boolean {
  const now = Date.now();
  const requestTime = parseInt(timestamp) * 1000;

  // Check timestamp tolerance
  if (Math.abs(now - requestTime) > toleranceMs) {
    return false;
  }

  const expectedSignature = generateRequestSignature(body, timestamp, secret);
  // Simplified comparison for Edge Runtime compatibility
  return signature.toLowerCase() === expectedSignature.toLowerCase();
}

// Removed Stripe webhook verification - not needed for B2B model

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 10000); // Limit length
}

// File validation
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'File type not allowed. Please upload PDF, image, or text files only.' 
    };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File size too large. Maximum size is 10MB.' 
    };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.php$/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return { 
      valid: false, 
      error: 'File name contains suspicious patterns.' 
    };
  }

  return { valid: true };
}

// Security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.openai.com",
      "frame-src 'self'",
      "form-action 'self'"
    ].join('; ')
  };
}

// IP geolocation and blocking (basic)
export function isBlockedRegion(ip: string): boolean {
  // In production, integrate with MaxMind or similar service
  // For now, basic implementation
  const blockedRanges = [
    // Add any IP ranges you want to block
  ];
  
  return false; // Placeholder - implement actual IP checking
}

// Session security
export function generateSecureToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Note: These functions require Node.js runtime, not Edge Runtime
// For production, consider using bcrypt or similar libraries
export function hashPassword(password: string): string {
  // Placeholder implementation - use bcrypt in production
  return `hashed_${password}_${Date.now()}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  // Placeholder implementation - use bcrypt in production
  return hashedPassword.includes(password);
}
