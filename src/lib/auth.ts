import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export interface UserSession {
  userId: string;
  email: string;
  plan: 'free' | 'plus';
  paddleSubscriptionId?: string;
  expiresAt: number;
  usageCount: number;
  maxUsage: number;
}

export interface AuthResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

// Generate secure session token
export async function createSession(userData: Omit<UserSession, 'expiresAt'>): Promise<string> {
  const session: UserSession = {
    ...userData,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };

  return await new SignJWT(session as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

// Verify session token
export async function verifySession(token: string): Promise<AuthResult> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as UserSession;

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      return { success: false, error: 'Session expired' };
    }

    return { success: true, session };
  } catch (error) {
    return { success: false, error: 'Invalid session' };
  }
}

// Get current session from cookies
export async function getCurrentSession(): Promise<AuthResult> {
  const cookieStore = await (cookies as any)();
  const token = cookieStore.get('labwise_session')?.value;

  if (!token) {
    return { success: false, error: 'No session found' };
  }

  return await verifySession(token);
}

// Verify Paddle payment status
export async function verifyPaddlePayment(paddleData: any): Promise<boolean> {
  try {
    const response = await fetch('https://vendors.paddle.com/api/2.0/subscription/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor_id: process.env.PADDLE_VENDOR_ID,
        vendor_auth_code: process.env.PADDLE_AUTH_CODE,
        subscription_id: paddleData.subscription_id,
      }),
    });

    const result = await response.json();
    return result.success && result.response[0]?.state === 'active';
  } catch (error) {
    console.error('Paddle verification failed:', error);
    return false;
  }
}

// Create free user session
export async function createFreeSession(email?: string): Promise<string> {
  const userId = `free_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return await createSession({
    userId,
    email: email || '',
    plan: 'free',
    usageCount: 0,
    maxUsage: 3,
  });
}

// Create paid user session after Paddle payment
export async function createPaidSession(
  email: string, 
  paddleSubscriptionId: string
): Promise<string> {
  const userId = `paid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return await createSession({
    userId,
    email,
    plan: 'plus',
    paddleSubscriptionId,
    usageCount: 0,
    maxUsage: -1, // Unlimited
  });
}

// Check if user can make another request
export function canMakeRequest(session: UserSession): boolean {
  if (session.plan === 'plus') return true; // Unlimited for paid users
  return session.usageCount < session.maxUsage;
}

// Increment usage count
export async function incrementUsage(session: UserSession): Promise<UserSession> {
  return {
    ...session,
    usageCount: session.usageCount + 1,
  };
}
