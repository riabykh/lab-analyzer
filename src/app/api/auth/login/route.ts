import { NextRequest, NextResponse } from 'next/server';
import { authenticatePatient, createPatientSession } from '@/lib/b2b-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const authResult = await authenticatePatient(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { patient, clinic } = authResult;
    const sessionToken = await createPatientSession(patient!, clinic!);

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set('patient_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return NextResponse.json({
      success: true,
      patient: {
        id: patient!.id,
        firstName: patient!.firstName,
        lastName: patient!.lastName,
        email: patient!.email
      },
      clinic: {
        id: clinic!.id,
        name: clinic!.name,
        primaryColor: clinic!.primaryColor
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
