import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import BuilderPage from './components/BuilderPage';

// Simple ProtectedRoute component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error("Error parsing user data", e);
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    // Force remove dark mode class from html element
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  const handleLogin = async (e, formData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        navigate('/builder');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback for demo/dev if backend is offline
      if (process.env.NODE_ENV === 'development') {
        console.log('Backend unreachable. Using demo mode.');
        const user = { name: formData.email.split('@')[0], email: formData.email };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'demo-token');
        setIsAuthenticated(true);
        setCurrentUser(user);
        navigate('/builder');
        alert('Demo Mode: Logged in (Backend Unreachable)');
        return;
      }
      alert('Login failed. Please check your connection.');
    }
  };

  const handleSignup = async (e, formData) => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...signupData } = formData;

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Signup successful! Please login.');
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (process.env.NODE_ENV === 'development') {
        alert('Demo Mode: Signup successful (Backend Unreachable)');
        navigate('/login');
        return;
      }
      alert('Signup failed. Please check your connection.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className="font-sans text-gray-900 bg-white transition-colors duration-300">
      <Navbar
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />

      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={<LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/signup"
            element={<SignupPage onSignup={handleSignup} />}
          />
          <Route
            path="/builder"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <BuilderPage currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;