import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui';
import type { PageId } from '@/types';

import HomePage from '@/pages/HomePage';
import AnnouncementsPage from '@/pages/AnnouncementsPage';
import ServicesPage from '@/pages/ServicesPage';
import OfficialsPage from '@/pages/OfficialsPage';
import AboutPage from '@/pages/AboutPage';
import AuthPage from '@/pages/AuthPage';
import ServiceRequestPage from '@/pages/ServiceRequestPage';
import BlotterPage from '@/pages/BlotterPage';
import TrackPage from '@/pages/TrackPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminRequests from '@/pages/admin/AdminRequests';
import AdminBlotter from '@/pages/admin/AdminBlotter';
import AdminOfficials from '@/pages/admin/AdminOfficials';
import AdminServices from '@/pages/admin/AdminServices';

const ADMIN_PAGES: PageId[] = [
  'admin-dashboard',
  'admin-announcements',
  'admin-requests',
  'admin-blotter',
  'admin-officials',
  'admin-services',
];

const RESIDENT_PAGES: PageId[] = ['service-request', 'blotter', 'track'];

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isAdminPage = ADMIN_PAGES.includes(currentPage);
  const isResidentPage = RESIDENT_PAGES.includes(currentPage);
  const isAuthPage = currentPage === 'login' || currentPage === 'signup';

  // Guard: admin pages require admin login
  if (isAdminPage && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md py-16">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Admin Access Required</h2>
            <p className="text-sm text-neutral-500 mb-6">You need an admin account to access this page.</p>
            <button
              onClick={() => handleNavigate('login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In as Admin
            </button>
          </div>
        </div>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  // Guard: resident pages require login
  if (isResidentPage && !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md py-16">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Sign In Required</h2>
            <p className="text-sm text-neutral-500 mb-6">Please sign in to access this page.</p>
            <button
              onClick={() => handleNavigate('login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  // Auth pages don't show header/footer
  if (isAuthPage) {
    return <AuthPage mode={currentPage === 'login' ? 'login' : 'signup'} onNavigate={handleNavigate} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'officials':
        return <OfficialsPage />;
      case 'about':
        return <AboutPage />;
      case 'service-request':
        return <ServiceRequestPage onNavigate={handleNavigate} />;
      case 'blotter':
        return <BlotterPage onNavigate={handleNavigate} />;
      case 'track':
        return <TrackPage onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'admin-announcements':
        return <AdminAnnouncements />;
      case 'admin-requests':
        return <AdminRequests />;
      case 'admin-blotter':
        return <AdminBlotter />;
      case 'admin-officials':
        return <AdminOfficials />;
      case 'admin-services':
        return <AdminServices />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
