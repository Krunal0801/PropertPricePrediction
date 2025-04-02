// client/src/App.js
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import BookmarksPage from './pages/BookmarksPage';
import ComparePage from './pages/ComparePage';
import PredictionPage from './pages/PredictionPage';
import NotFound from './pages/NotFound';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Notification from './components/common/Notification';

import './App.css';

function App() {
  const { loadUser } = useAuth();
  
  // Load user on app initialization
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/bookmarks" element={<PrivateRoute><BookmarksPage /></PrivateRoute>} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Notification />
      <Footer />
    </div>
  );
}

export default App;