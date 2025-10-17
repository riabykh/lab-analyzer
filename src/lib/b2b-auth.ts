import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// B2B User types
export interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  clinicId: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Clinic {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  domain: string;
  contactEmail: string;
  isActive: boolean;
}

export interface UserSession {
  patientId: string;
  email: string;
  firstName: string;
  lastName: string;
  clinicId: string;
  clinicName: string;
  expiresAt: number;
}

// Mock data - In production, this would come from a database
const MOCK_CLINICS: Clinic[] = [
  {
    id: 'clinic_1',
    name: 'HealthFirst Medical Center',
    logo: '/logos/healthfirst.png',
    primaryColor: '#2563eb',
    domain: 'healthfirst.labwise.com',
    contactEmail: 'support@healthfirst.com',
    isActive: true
  },
  {
    id: 'clinic_2', 
    name: 'Wellness Plus Clinic',
    logo: '/logos/wellnessplus.png',
    primaryColor: '#059669',
    domain: 'wellness.labwise.com',
    contactEmail: 'help@wellnessplus.com',
    isActive: true
  }
];

const MOCK_PATIENTS: Patient[] = [
  {
    id: 'patient_1',
    email: 'john.doe@email.com',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-03-15',
    clinicId: 'clinic_1',
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-12-20T14:30:00Z'
  },
  {
    id: 'patient_2',
    email: 'jane.smith@email.com', 
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1990-07-22',
    clinicId: 'clinic_1',
    createdAt: '2024-02-01T09:15:00Z',
    lastLogin: '2024-12-19T16:45:00Z'
  },
  {
    id: 'patient_3',
    email: 'mike.johnson@email.com',
    firstName: 'Mike', 
    lastName: 'Johnson',
    dateOfBirth: '1978-11-08',
    clinicId: 'clinic_2',
    createdAt: '2024-01-20T11:30:00Z'
  }
];

// Predefined credentials (clinic_id:patient_email:password)
const PREDEFINED_CREDENTIALS = new Map([
  ['john.doe@email.com', { password: 'demo123', clinicId: 'clinic_1', patientId: 'patient_1' }],
  ['jane.smith@email.com', { password: 'demo456', clinicId: 'clinic_1', patientId: 'patient_2' }],
  ['mike.johnson@email.com', { password: 'demo789', clinicId: 'clinic_2', patientId: 'patient_3' }],
]);

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function authenticatePatient(email: string, password: string): Promise<{
  success: boolean;
  patient?: Patient;
  clinic?: Clinic;
  error?: string;
}> {
  const credentials = PREDEFINED_CREDENTIALS.get(email);
  
  if (!credentials || credentials.password !== password) {
    return { success: false, error: 'Invalid email or password' };
  }

  const patient = MOCK_PATIENTS.find(p => p.id === credentials.patientId);
  const clinic = MOCK_CLINICS.find(c => c.id === credentials.clinicId);

  if (!patient || !clinic || !clinic.isActive) {
    return { success: false, error: 'Account not found or clinic inactive' };
  }

  // Update last login
  patient.lastLogin = new Date().toISOString();

  return { success: true, patient, clinic };
}

export async function createPatientSession(patient: Patient, clinic: Clinic): Promise<string> {
  const session: UserSession = {
    patientId: patient.id,
    email: patient.email,
    firstName: patient.firstName,
    lastName: patient.lastName,
    clinicId: clinic.id,
    clinicName: clinic.name,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  const token = await new SignJWT(session as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyPatientSession(token: string): Promise<{
  success: boolean;
  session?: UserSession;
  error?: string;
}> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as UserSession;

    if (session.expiresAt < Date.now()) {
      return { success: false, error: 'Session expired' };
    }

    return { success: true, session };
  } catch (error) {
    return { success: false, error: 'Invalid session' };
  }
}

export async function getCurrentPatientSession(): Promise<{
  success: boolean;
  session?: UserSession;
  patient?: Patient;
  clinic?: Clinic;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('patient_session')?.value;

    if (!token) {
      return { success: false };
    }

    const verification = await verifyPatientSession(token);
    if (!verification.success || !verification.session) {
      return { success: false };
    }

    const patient = MOCK_PATIENTS.find(p => p.id === verification.session!.patientId);
    const clinic = MOCK_CLINICS.find(c => c.id === verification.session!.clinicId);

    return {
      success: true,
      session: verification.session,
      patient,
      clinic
    };
  } catch (error) {
    return { success: false };
  }
}

export function getClinicByDomain(domain: string): Clinic | undefined {
  return MOCK_CLINICS.find(c => c.domain === domain || c.id === domain);
}

export function getAllClinics(): Clinic[] {
  return MOCK_CLINICS.filter(c => c.isActive);
}
