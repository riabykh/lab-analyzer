export interface LabTest {
  id: string;
  patientId: string;
  testName: string;
  testDate: string;
  uploadedAt: string;
  fileName: string;
  fileType: string;
  status: 'pending' | 'analyzed' | 'error';
  analysis?: LabAnalysis;
}

export interface LabAnalysis {
  id: string;
  testId: string;
  results: LabResult[];
  insights: HealthInsight[];
  summary: string;
  analyzedAt: string;
  aiModel: string;
}

export interface LabResult {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'high' | 'low' | 'unknown';
  interpretation: string;
}

export interface HealthInsight {
  category: 'nutrition' | 'exercise' | 'lifestyle' | 'monitoring' | 'general';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

// Mock lab test history data
const MOCK_LAB_TESTS: LabTest[] = [
  {
    id: 'test_1',
    patientId: 'patient_1',
    testName: 'Complete Blood Count (CBC)',
    testDate: '2024-12-15',
    uploadedAt: '2024-12-15T09:30:00Z',
    fileName: 'cbc_results_dec2024.pdf',
    fileType: 'application/pdf',
    status: 'analyzed',
    analysis: {
      id: 'analysis_1',
      testId: 'test_1',
      results: [
        {
          testName: 'White Blood Cell Count',
          value: '7.2',
          unit: '10³/μL',
          referenceRange: '4.0-11.0',
          status: 'normal',
          interpretation: 'Your white blood cell count is within the normal range, indicating a healthy immune system.'
        },
        {
          testName: 'Red Blood Cell Count',
          value: '4.8',
          unit: '10⁶/μL',
          referenceRange: '4.2-5.4',
          status: 'normal',
          interpretation: 'Your red blood cell count is normal, suggesting good oxygen-carrying capacity.'
        },
        {
          testName: 'Hemoglobin',
          value: '14.2',
          unit: 'g/dL',
          referenceRange: '12.0-16.0',
          status: 'normal',
          interpretation: 'Your hemoglobin level is excellent, indicating good oxygen transport throughout your body.'
        }
      ],
      insights: [
        {
          category: 'general',
          title: 'Excellent Blood Health',
          description: 'Your complete blood count shows all values within optimal ranges, indicating excellent overall blood health.',
          priority: 'low',
          actionable: false
        },
        {
          category: 'lifestyle',
          title: 'Maintain Current Habits',
          description: 'Continue your current lifestyle habits as they are supporting healthy blood parameters.',
          priority: 'medium',
          actionable: true
        }
      ],
      summary: 'Your complete blood count results are excellent with all parameters within normal ranges. This indicates a healthy immune system, good oxygen-carrying capacity, and overall blood health.',
      analyzedAt: '2024-12-15T09:35:00Z',
      aiModel: 'gpt-4o-2024-11-20'
    }
  },
  {
    id: 'test_2',
    patientId: 'patient_1',
    testName: 'Lipid Panel',
    testDate: '2024-11-20',
    uploadedAt: '2024-11-20T14:15:00Z',
    fileName: 'lipid_panel_nov2024.pdf',
    fileType: 'application/pdf',
    status: 'analyzed',
    analysis: {
      id: 'analysis_2',
      testId: 'test_2',
      results: [
        {
          testName: 'Total Cholesterol',
          value: '195',
          unit: 'mg/dL',
          referenceRange: '<200',
          status: 'normal',
          interpretation: 'Your total cholesterol is within the desirable range, supporting cardiovascular health.'
        },
        {
          testName: 'LDL Cholesterol',
          value: '125',
          unit: 'mg/dL',
          referenceRange: '<100',
          status: 'high',
          interpretation: 'Your LDL cholesterol is slightly elevated. Consider dietary modifications and regular exercise.'
        },
        {
          testName: 'HDL Cholesterol',
          value: '55',
          unit: 'mg/dL',
          referenceRange: '>40',
          status: 'normal',
          interpretation: 'Your HDL cholesterol is at a good level, providing cardiovascular protection.'
        }
      ],
      insights: [
        {
          category: 'nutrition',
          title: 'Heart-Healthy Diet',
          description: 'Consider incorporating more omega-3 rich foods, fiber, and reducing saturated fats to help optimize your cholesterol levels.',
          priority: 'high',
          actionable: true
        },
        {
          category: 'exercise',
          title: 'Regular Cardio Exercise',
          description: 'Aim for 150 minutes of moderate-intensity aerobic exercise per week to help improve your cholesterol profile.',
          priority: 'high',
          actionable: true
        },
        {
          category: 'monitoring',
          title: 'Follow-up Testing',
          description: 'Consider retesting your lipid panel in 3-6 months to monitor progress after lifestyle modifications.',
          priority: 'medium',
          actionable: true
        }
      ],
      summary: 'Your lipid panel shows mostly healthy levels with slightly elevated LDL cholesterol. Focus on heart-healthy nutrition and regular exercise to optimize your cardiovascular health.',
      analyzedAt: '2024-11-20T14:20:00Z',
      aiModel: 'gpt-4o-2024-11-20'
    }
  },
  {
    id: 'test_3',
    patientId: 'patient_1',
    testName: 'Thyroid Function Panel',
    testDate: '2024-10-10',
    uploadedAt: '2024-10-10T11:45:00Z',
    fileName: 'thyroid_test_oct2024.pdf',
    fileType: 'application/pdf',
    status: 'analyzed',
    analysis: {
      id: 'analysis_3',
      testId: 'test_3',
      results: [
        {
          testName: 'TSH',
          value: '2.1',
          unit: 'mIU/L',
          referenceRange: '0.4-4.0',
          status: 'normal',
          interpretation: 'Your thyroid stimulating hormone level is within the normal range, indicating healthy thyroid function.'
        },
        {
          testName: 'Free T4',
          value: '1.3',
          unit: 'ng/dL',
          referenceRange: '0.8-1.8',
          status: 'normal',
          interpretation: 'Your free T4 level is normal, supporting healthy metabolism and energy levels.'
        }
      ],
      insights: [
        {
          category: 'general',
          title: 'Healthy Thyroid Function',
          description: 'Your thyroid function tests indicate normal hormone production and regulation.',
          priority: 'low',
          actionable: false
        },
        {
          category: 'lifestyle',
          title: 'Support Thyroid Health',
          description: 'Maintain adequate iodine intake through seafood and dairy, and ensure sufficient sleep for optimal thyroid function.',
          priority: 'low',
          actionable: true
        }
      ],
      summary: 'Your thyroid function panel shows normal TSH and Free T4 levels, indicating healthy thyroid hormone production and metabolism regulation.',
      analyzedAt: '2024-10-10T11:50:00Z',
      aiModel: 'gpt-4o-2024-11-20'
    }
  },
  {
    id: 'test_4',
    patientId: 'patient_2',
    testName: 'Comprehensive Metabolic Panel',
    testDate: '2024-12-10',
    uploadedAt: '2024-12-10T16:20:00Z',
    fileName: 'cmp_results_dec2024.pdf',
    fileType: 'application/pdf',
    status: 'analyzed',
    analysis: {
      id: 'analysis_4',
      testId: 'test_4',
      results: [
        {
          testName: 'Glucose',
          value: '92',
          unit: 'mg/dL',
          referenceRange: '70-100',
          status: 'normal',
          interpretation: 'Your fasting glucose level is excellent, indicating good blood sugar control.'
        },
        {
          testName: 'Creatinine',
          value: '0.9',
          unit: 'mg/dL',
          referenceRange: '0.6-1.2',
          status: 'normal',
          interpretation: 'Your creatinine level is normal, suggesting healthy kidney function.'
        }
      ],
      insights: [
        {
          category: 'general',
          title: 'Excellent Metabolic Health',
          description: 'Your metabolic panel shows optimal glucose control and kidney function.',
          priority: 'low',
          actionable: false
        }
      ],
      summary: 'Your comprehensive metabolic panel demonstrates excellent metabolic health with normal glucose and kidney function markers.',
      analyzedAt: '2024-12-10T16:25:00Z',
      aiModel: 'gpt-4o-2024-11-20'
    }
  }
];

export function getPatientLabTests(patientId: string): LabTest[] {
  return MOCK_LAB_TESTS
    .filter(test => test.patientId === patientId)
    .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
}

export function getLabTestById(testId: string): LabTest | undefined {
  return MOCK_LAB_TESTS.find(test => test.id === testId);
}

export function getLabTestsByDateRange(patientId: string, startDate: string, endDate: string): LabTest[] {
  return MOCK_LAB_TESTS
    .filter(test => 
      test.patientId === patientId &&
      test.testDate >= startDate &&
      test.testDate <= endDate
    )
    .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
}

export function getRecentLabTests(patientId: string, limit: number = 5): LabTest[] {
  return getPatientLabTests(patientId).slice(0, limit);
}

export function getLabTestStats(patientId: string): {
  totalTests: number;
  analyzedTests: number;
  pendingTests: number;
  lastTestDate?: string;
} {
  const tests = getPatientLabTests(patientId);
  
  return {
    totalTests: tests.length,
    analyzedTests: tests.filter(t => t.status === 'analyzed').length,
    pendingTests: tests.filter(t => t.status === 'pending').length,
    lastTestDate: tests.length > 0 ? tests[0].testDate : undefined
  };
}
