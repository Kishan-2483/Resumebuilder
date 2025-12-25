import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import BuilderPage from './components/BuilderPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
        setCurrentPage('builder');
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
        setCurrentPage('builder');
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
        setCurrentPage('login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (process.env.NODE_ENV === 'development') {
        alert('Demo Mode: Signup successful (Backend Unreachable)');
        setCurrentPage('login');
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
    setCurrentPage('landing');
  };

  return (
    <div className="font-sans text-gray-900 bg-white">
      <Navbar
        isAuthenticated={isAuthenticated}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />

      <main>
        {currentPage === 'landing' && (
          <LandingPage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'signup' && (
          <SignupPage
            onSignup={handleSignup}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'builder' && (
          isAuthenticated ? (
            <BuilderPage currentUser={currentUser} />
          ) : (
            // Redirect or show message if trying to access builder while logged out
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-6">Please log in to build your resume.</p>
                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default App;