import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export interface UserSession {
  userId: string;
  email: string;
  plan: 'free' | 'plus';
  stripeSubscriptionId?: string;
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

// Verify Stripe payment status
export async function verifyStripePayment(stripeData: any): Promise<boolean> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return false;
    }

    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${stripeData.subscription_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = await response.json();
    return result.status === 'active';
  } catch (error) {
    console.error('Stripe verification failed:', error);
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

// Create paid user session after Stripe payment
export async function createPaidSession(
  email: string, 
  stripeSubscriptionId: string
): Promise<string> {
  const userId = `paid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return await createSession({
    userId,
    email,
    plan: 'plus',
    stripeSubscriptionId,
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
