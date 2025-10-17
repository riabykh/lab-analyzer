'use client';

import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  User, 
  LogOut, 
  Menu, 
  X,
  Clock,
  Activity,
  Heart,
  Brain
} from 'lucide-react';
import { UserSession, Patient, Clinic } from '@/lib/b2b-auth';
import { getPatientLabTests, getLabTestStats } from '@/lib/lab-history';
import LabTestList from './LabTestList';
import LabTestDetail from './LabTestDetail';

interface PatientDashboardProps {
  session: UserSession;
  patient: Patient;
  clinic: Clinic;
}

type ActiveView = 'overview' | 'tests' | 'insights' | 'profile';

export default function PatientDashboard({ session, patient, clinic }: PatientDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const labTests = getPatientLabTests(patient.id);
  const stats = getLabTestStats(patient.id);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'tests', label: 'Lab Tests', icon: FileText },
    { id: 'insights', label: 'Health Insights', icon: Brain },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    if (selectedTestId) {
      return (
        <LabTestDetail 
          testId={selectedTestId} 
          onBack={() => setSelectedTestId(null)}
        />
      );
    }

    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {patient.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's your health overview from {clinic.name}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Analyzed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.analyzedTests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Test</p>
                    <p className="text-sm font-medium text-gray-900">
                      {stats.lastTestDate ? new Date(stats.lastTestDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Lab Tests</h2>
              </div>
              <div className="p-6">
                {labTests.length > 0 ? (
                  <div className="space-y-4">
                    {labTests.slice(0, 3).map((test) => (
                      <div 
                        key={test.id}
                        onClick={() => setSelectedTestId(test.id)}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{test.testName}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(test.testDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.status === 'analyzed' ? 'bg-green-100 text-green-800' :
                          test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No lab tests yet</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'tests':
        return <LabTestList tests={labTests} onSelectTest={setSelectedTestId} />;

      case 'insights':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Insights</h1>
              <p className="text-gray-600 mt-1">
                AI-powered insights from your lab results
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-blue-900">Important Note</h2>
              </div>
              <p className="text-blue-800">
                The insights provided are for informational purposes only and are not medical advice. 
                Always consult with your healthcare provider for medical decisions and treatment plans.
              </p>
            </div>

            {labTests.filter(test => test.analysis).length > 0 ? (
              <div className="space-y-6">
                {labTests.filter(test => test.analysis).map((test) => (
                  <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">{test.testName}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(test.testDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {test.analysis!.insights.map((insight, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                                insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {insight.priority}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                            <p className="text-sm text-gray-600">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Yet</h3>
                <p className="text-gray-600">
                  Upload and analyze your lab tests to see personalized health insights.
                </p>
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">Your account information</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-gray-900">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{patient.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Clinic</label>
                  <p className="mt-1 text-gray-900">{clinic.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="mt-1 text-gray-900">
                    {patient.lastLogin ? new Date(patient.lastLogin).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Clinic branding */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-bold" style={{ color: clinic.primaryColor }}>
              {clinic.name}
            </h1>
            <p className="text-xs text-gray-500">LabWise Platform</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as ActiveView);
                    setSelectedTestId(null);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: clinic.primaryColor } : {}}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{patient.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
