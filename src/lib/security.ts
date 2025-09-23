import crypto from 'crypto';

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
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
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
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Paddle webhook signature verification
export function verifyPaddleWebhook(body: string, signature: string): boolean {
  const publicKey = process.env.PADDLE_PUBLIC_KEY;
  if (!publicKey || !signature) return false;

  try {
    // Parse signature
    const sig = Buffer.from(signature, 'base64');
    
    // Verify using RSA-SHA1 (Paddle's method)
    const verifier = crypto.createVerify('RSA-SHA1');
    verifier.update(body);
    
    return verifier.verify(publicKey, sig);
  } catch (error) {
    console.error('Paddle signature verification failed:', error);
    return false;
  }
}

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
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.openai.com https://vendors.paddle.com",
      "frame-src https://sandbox-checkout.paddle.com https://checkout.paddle.com",
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
  return crypto.randomBytes(32).toString('hex');
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}
