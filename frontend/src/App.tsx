import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { initScrollAnimations } from './utils/animations';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
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
  // Initialize scroll animations on component mount
  useEffect(() => {
    initScrollAnimations();
    
    // Re-initialize when route changes
    const handleRouteChange = () => {
      setTimeout(() => {
        initScrollAnimations();
      }, 100);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="pricing" element={<PricingPage />} />
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
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App; 