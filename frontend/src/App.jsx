import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const ResumeBuilder = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [template, setTemplate] = useState('modern');
  const [atsScore, setAtsScore] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      summary: ''
    },
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }],
    education: [{
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    }],
    skills: [''],
    certifications: [{
      name: '',
      issuer: '',
      date: ''
    }]
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setCurrentPage('builder');
        alert('Login successful!');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.log('Demo mode - Login:', loginForm);
      const user = { name: loginForm.email.split('@')[0], email: loginForm.email };
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setCurrentUser(user);
      setCurrentPage('builder');
      alert('Demo: Logged in successfully!');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      });

      const data = await response.json();

      if (data.success) {
        alert('Signup successful! Please login.');
        setCurrentPage('login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.log('Demo mode - Signup:', signupForm);
      alert('Demo: Account created! Please login.');
      setCurrentPage('login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      if (index !== null) {
        const newSection = [...prev[section]];
        newSection[index] = { ...newSection[index], [field]: value };
        return { ...prev, [section]: newSection };
      } else if (section === 'personalInfo') {
        return { ...prev, personalInfo: { ...prev.personalInfo, [field]: value } };
      }
      return prev;
    });
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSection = (section) => {
    const templates = {
      experience: { company: '', position: '', startDate: '', endDate: '', description: '' },
      education: { institution: '', degree: '', field: '', graduationDate: '', gpa: '' },
      certifications: { name: '', issuer: '', date: '' }
    };
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], templates[section]]
    }));
  };

  const removeSection = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const calculateATS = (resume) => {
    let score = 0;
    const { personalInfo, experience, education, skills } = resume;

    if (personalInfo.email && personalInfo.phone) score += 15;
    if (personalInfo.summary && personalInfo.summary.length > 50) score += 15;
    if (experience.length > 0 && experience[0].company) score += 20;
    if (education.length > 0 && education[0].institution) score += 15;
    if (skills.filter(s => s.trim()).length >= 5) score += 20;
    if (personalInfo.linkedin || personalInfo.github) score += 10;
    if (resume.certifications && resume.certifications[0]?.name) score += 5;

    return Math.min(score, 100);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const score = calculateATS(formData);
      setAtsScore(score);
    }
  };

  const saveToDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          template,
          atsScore: atsScore || calculateATS(formData),
          createdAt: new Date()
        })
      });

      if (response.ok) {
        alert('Resume saved successfully!');
      }
    } catch (error) {
      console.log('Demo mode - would save to MongoDB:', formData);
      alert('Demo: Resume data logged to console');
    }
  };

  const downloadResume = (format) => {
    alert(`Resume would be downloaded as ${format.toUpperCase()}`);
  };

  const ModernTemplate = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="border-l-4 border-blue-600 pl-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{formData.personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-gray-600 text-lg">{formData.experience[0]?.position || 'Professional Title'}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        {formData.personalInfo.email && (
          <div className="flex items-center gap-2">
            <span>✉️</span>
            <span>{formData.personalInfo.email}</span>
          </div>
        )}
        {formData.personalInfo.phone && (
          <div className="flex items-center gap-2">
            <span>📱</span>
            <span>{formData.personalInfo.phone}</span>
          </div>
        )}
        {formData.personalInfo.location && (
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{formData.personalInfo.location}</span>
          </div>
        )}
      </div>

      {formData.personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">Professional Summary</h2>
          <p className="text-gray-700">{formData.personalInfo.summary}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">Experience</h2>
        {formData.experience.map((exp, idx) => (
          exp.company && (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{exp.position}</h3>
                  <p className="text-blue-600">{exp.company}</p>
                </div>
                <span className="text-gray-600 text-sm">{exp.startDate} - {exp.endDate || 'Present'}</span>
              </div>
              <p className="text-gray-700 mt-2">{exp.description}</p>
            </div>
          )
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">Education</h2>
        {formData.education.map((edu, idx) => (
          edu.institution && (
            <div key={idx} className="mb-3">
              <h3 className="font-bold text-gray-800">{edu.degree} in {edu.field}</h3>
              <p className="text-blue-600">{edu.institution}</p>
              <p className="text-gray-600 text-sm">{edu.graduationDate}</p>
            </div>
          )
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {formData.skills.filter(s => s.trim()).map((skill, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // Navigation Bar
  const Navbar = () => (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentPage(isAuthenticated ? 'builder' : 'landing')}
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <span className="text-white text-2xl">📄</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ResumeBuilder Pro
              </h1>
              <p className="text-xs text-gray-500">Build Your Future</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated && currentPage === 'landing' && (
              <>
                <button
                  onClick={() => setCurrentPage('landing')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    const features = document.getElementById('features');
                    features?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    const howItWorks = document.getElementById('how-it-works');
                    howItWorks?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  How It Works
                </button>
              </>
            )}

            {isAuthenticated && (
              <>
                <button
                  onClick={() => setCurrentPage('builder')}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${currentPage === 'builder' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                  My Resumes
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md"
                >
                  <span>👁️</span>
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
                <button
                  onClick={saveToDatabase}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                >
                  <span>✅</span>
                  Save
                </button>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <span>👤</span>
                  <span className="text-gray-700 font-medium">{currentUser?.name || currentUser?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentPage('signup')}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                >
                  Sign Up Free
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-blue-600 p-2 text-2xl"
          >
            {mobileMenuOpen ? '✖️' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
            {!isAuthenticated && currentPage === 'landing' && (
              <>
                <button
                  onClick={() => {
                    setCurrentPage('landing');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    const features = document.getElementById('features');
                    features?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                >
                  Features
                </button>
              </>
            )}

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setCurrentPage('builder');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium"
                >
                  My Resumes
                </button>
                <button
                  onClick={() => {
                    setShowPreview(!showPreview);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
                <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{currentUser?.name || currentUser?.email}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setCurrentPage('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setCurrentPage('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );

  // Landing Page
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-2xl">✨</span>
                <span className="text-blue-600 font-semibold text-sm">AI-Powered Resume Builder</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Build Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dream Resume</span> in Minutes
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Create professional, ATS-friendly resumes that get you noticed. Join thousands of job seekers landing their dream jobs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setCurrentPage('signup')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
                >
                  Get Started Free
                  <span>→</span>
                </button>
                <button
                  onClick={() => {
                    const features = document.getElementById('features');
                    features?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-md font-semibold text-lg border border-gray-200"
                >
                  See How It Works
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-bold text-gray-900">10,000+</p>
                    <p className="text-sm text-gray-600">Happy Users</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="font-bold text-gray-900">95%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded w-3/4">
                    🏫</div>
                  <div className="h-4 bg-gray-200 rounded w-1/2">🧑‍🎓</div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                        💼
                      </div>
                      <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                        🎓
                      </div>
                      <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose ResumeBuilder Pro?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to create the perfect resume
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all border border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Create professional resumes in minutes with our intuitive drag-and-drop interface and smart templates.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all border border-purple-200">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl">
                🛡️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">ATS Optimized</h3>
              <p className="text-gray-600 leading-relaxed">
                Pass applicant tracking systems with our AI-powered ATS checker that scores and optimizes your resume.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all border border-green-200">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Beautiful Templates</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose from dozens of professionally designed templates that make you stand out from the crowd.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to your perfect resume
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">
                Sign up for free in seconds and get instant access to all our resume building tools.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Fill Your Info</h3>
              <p className="text-gray-600">
                Enter your information using our guided form. Add experience, education, and skills effortlessly.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Download & Apply</h3>
              <p className="text-gray-600">
                Download your ATS-optimized resume in PDF or DOCX format and start applying to jobs!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have successfully created their perfect resume
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage('signup')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all shadow-lg font-semibold text-lg flex items-center justify-center gap-2"
            >
              Start Building Now
              <span>→</span>
            </button>
            <button
              onClick={() => setCurrentPage('login')}
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all font-semibold text-lg"
            >
              Already Have Account?
            </button>
          </div>
          <p className="text-blue-100 mt-6 flex items-center justify-center gap-2">
            <span>⏱️</span>
            No credit card required • Free forever
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📄</span>
                <span className="text-xl font-bold">ResumeBuilder Pro</span>
              </div>
              <p className="text-gray-400">
                Build professional resumes that get you hired.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">Features</li>
                <li className="hover:text-white cursor-pointer">Templates</li>
                <li className="hover:text-white cursor-pointer">Pricing</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
                <li className="hover:text-white cursor-pointer">Blog</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 ResumeBuilder Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );

  // Login Page
  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-4xl">
                📄
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Login to continue building your resume</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Login to Your Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentPage('signup')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign Up Free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Signup Page
  const SignupPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-4xl">
                👤
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
            <p className="text-gray-600">Start building professional resumes today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={signupForm.fullName}
                onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              Create Free Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-purple-600 font-semibold hover:underline"
              >
                Login Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Builder Page
  const BuilderPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {showPreview ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6 flex justify-end gap-3">
            <button
              onClick={() => downloadResume('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              <span>⬇️</span>
              PDF
            </button>
            <button
              onClick={() => downloadResume('docx')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              <span>⬇️</span>
              DOCX
            </button>
          </div>
          <ModernTemplate />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>⭐</span>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.personalInfo.fullName}
                    onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.personalInfo.location}
                    onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={formData.personalInfo.linkedin}
                    onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="GitHub URL"
                    value={formData.personalInfo.github}
                    onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <textarea
                  placeholder="Professional Summary"
                  value={formData.personalInfo.summary}
                  onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                  rows="4"
                  className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Experience */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>💼</span>
                    Experience
                  </h2>
                  <button
                    onClick={() => addSection('experience')}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <span>➕</span>
                    Add
                  </button>
                </div>
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => removeSection('experience', idx)}
                        className="text-red-600 hover:text-red-700 text-xl"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => handleInputChange('experience', 'company', e.target.value, idx)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={exp.position}
                        onChange={(e) => handleInputChange('experience', 'position', e.target.value, idx)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, idx)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, idx)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={exp.description}
                      onChange={(e) => handleInputChange('experience', 'description', e.target.value, idx)}
                      rows="3"
                      className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>🎓</span>
                    Education
                  </h2>
                  <button
                    onClick={() => addSection('education')}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <span>➕</span>
                    Add
                  </button>
                </div>
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => removeSection('education', idx)}
                        className="text-red-600 hover:text-red-700 text-xl"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => handleInputChange('education', 'institution', e.target.value, idx)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => handleInputChange('education', 'degree', e.target.value, idx)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={edu.field}
                        onChange={(e) => handleInputChange('education', 'field', e.target.value, idx)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Graduation Date"
                        value={edu.graduationDate}
                        onChange={(e) => handleInputChange('education', 'graduationDate', e.target.value, idx)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>🏆</span>
                    Skills
                  </h2>
                  <button
                    onClick={addSkill}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <span>➕</span>
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.skills.map((skill, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Skill"
                        value={skill}
                        onChange={(e) => handleSkillChange(idx, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeSkill(idx)}
                        className="text-red-600 hover:text-red-700 text-xl"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* ATS Score Checker */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📤</span>
                  ATS Score Checker
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
                >
                  Upload & Check Score
                </button>
                {atsScore !== null && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">ATS Score</span>
                      <span className={`text-2xl font-bold ${atsScore >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                        {atsScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${atsScore >= 70 ? 'bg-green-600' : 'bg-orange-600'}`}
                        style={{ width: `${atsScore}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {atsScore >= 70 ? 'Excellent! Your resume is ATS-friendly.' : 'Add more details to improve your score.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Templates */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Choose Template</h3>
                <div className="space-y-3">
                  {['modern', 'classic', 'creative'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTemplate(t)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${template === t
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Quick Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Use action verbs in descriptions</li>
                  <li>• Quantify your achievements</li>
                  <li>• Keep it concise (1-2 pages)</li>
                  <li>• Tailor for each job application</li>
                  <li>• Include relevant keywords</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'signup' && <SignupPage />}
      {currentPage === 'builder' && isAuthenticated && <BuilderPage />}
    </div>
  );
};

export default ResumeBuilder;