import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { initScrollAnimations } from './utils/animations';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import FeaturesPage from './pages/FeaturesPage';
import DocumentationPage from './pages/DocumentationPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import CareersPage from './pages/CareersPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import HelpPage from './pages/HelpPage';
import TutorialPage from './pages/TutorialPage';
import OpinionsPage from './pages/OpinionsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import BotDetailPage from './pages/dashboard/BotDetailPage';
import BacktestReportPage from './pages/dashboard/BacktestReportPage';
import NewBotPage from './pages/dashboard/NewBotPage';
import SettingsPage from './pages/dashboard/SettingsPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  const location = useLocation();
  
  // Initialize scroll animations on component mount and route changes
  useEffect(() => {
    // Short timeout to ensure the DOM has updated
    setTimeout(() => {
      initScrollAnimations();
      window.scrollTo(0, 0); // Scroll to top on route change
    }, 100);
  }, [location.pathname]); // Re-run when the path changes
  
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="documentation" element={<DocumentationPage />} />
        <Route path="about" element={<AboutUsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="cookies" element={<CookiesPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="help/:tutorialSlug" element={<TutorialPage />} />
        <Route path="opinions" element={<OpinionsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      
      {/* Protected dashboard routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="new" element={<NewBotPage />} />
        <Route path=":botId" element={<BotDetailPage />} />
        <Route path="backtest/report/:backtestId" element={<BacktestReportPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App; 