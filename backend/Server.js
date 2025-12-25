// server.js - Node.js Backend with MongoDB and Authentication
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection - FIXED VERSION
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resumebuilder';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Resume Schema
const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    summary: String
  },
  experience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    description: String,
    current: { type: Boolean, default: false }
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    graduationDate: String,
    gpa: String
  }],
  skills: [String],
  certifications: [{
    name: String,
    issuer: String,
    date: String
  }],
  template: {
    type: String,
    default: 'modern',
    enum: ['modern', 'classic', 'creative']
  },
  atsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
resumeSchema.index({ userId: 1, updatedAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

// ATS Score Schema
const atsScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  fileName: String,
  fileType: String,
  fileSize: Number,
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  analysis: {
    hasContactInfo: Boolean,
    hasSummary: Boolean,
    experienceCount: Number,
    educationCount: Number,
    skillsCount: Number,
    hasLinks: Boolean,
    hasCertifications: Boolean,
    wordCount: Number,
    keywordMatches: [String]
  },
  recommendations: [String],
  checkedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ATSScore = mongoose.model('ATSScore', atsScoreSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// Enhanced ATS Score Calculation Function
function calculateATSScore(text, data = null) {
  let score = 0;
  const recommendations = [];
  const analysis = {
    hasContactInfo: false,
    hasSummary: false,
    experienceCount: 0,
    educationCount: 0,
    skillsCount: 0,
    hasLinks: false,
    hasCertifications: false,
    wordCount: 0,
    keywordMatches: []
  };

  // Word count
  analysis.wordCount = text.split(/\s+/).length;

  // Check for contact information (15 points)
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;

  if (emailRegex.test(text) && phoneRegex.test(text)) {
    score += 15;
    analysis.hasContactInfo = true;
  } else {
    recommendations.push('✉️ Add complete contact information (email and phone number)');
  }

  // Check for professional summary (15 points)
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  const hasSummarySection = summaryKeywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (hasSummarySection) {
    const summaryMatch = text.match(new RegExp(`(${summaryKeywords.join('|')})`, 'i'));
    if (summaryMatch && text.length > summaryMatch.index + 100) {
      score += 15;
      analysis.hasSummary = true;
    }
  }

  if (!analysis.hasSummary) {
    recommendations.push('📝 Include a compelling professional summary at the top');
  }

  // Check for experience section (20 points)
  const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience'];
  const hasExperience = experienceKeywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (hasExperience) {
    const jobIndicators = text.match(/\d{4}\s*[-–]\s*(\d{4}|present|current)/gi);
    analysis.experienceCount = jobIndicators ? jobIndicators.length : 1;

    if (analysis.experienceCount >= 2) {
      score += 20;
    } else if (analysis.experienceCount === 1) {
      score += 15;
      recommendations.push('💼 Add more work experience entries to strengthen your profile');
    }
  } else {
    recommendations.push('💼 Add your work experience with specific dates and achievements');
  }

  // Check for education (15 points)
  const educationKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd'];
  const hasEducation = educationKeywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (hasEducation) {
    score += 15;
    analysis.educationCount = 1;

    // Bonus for multiple degrees
    const degreeTypes = ['bachelor', 'master', 'phd', 'doctorate'].filter(degree =>
      text.toLowerCase().includes(degree)
    );
    if (degreeTypes.length > 1) {
      score += 3;
    }
  } else {
    recommendations.push('🎓 Include your educational background');
  }

  // Check for skills section (20 points)
  const skillsKeywords = ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies'];
  const hasSkills = skillsKeywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (hasSkills) {
    const skillsMatch = text.match(new RegExp(`(${skillsKeywords.join('|')})[:\\s]+([^]*?)(?:\\n\\n|\\n[A-Z])`, 'i'));
    if (skillsMatch) {
      const skillsText = skillsMatch[2];
      const commaCount = (skillsText.match(/,/g) || []).length;
      const bulletCount = (skillsText.match(/•|·|-/g) || []).length;
      analysis.skillsCount = Math.max(commaCount + 1, bulletCount);

      if (analysis.skillsCount >= 8) {
        score += 20;
      } else if (analysis.skillsCount >= 5) {
        score += 15;
        recommendations.push('🎯 Add a few more relevant skills (aim for 8-12)');
      } else {
        score += 10;
        recommendations.push('🎯 Add more relevant technical and soft skills (aim for 8-12)');
      }
    }
  } else {
    recommendations.push('🎯 Add a comprehensive skills section with relevant keywords');
  }

  // Check for LinkedIn/GitHub/Portfolio (10 points)
  const socialLinks = ['linkedin.com', 'github.com', 'portfolio', 'website'];
  const hasLinks = socialLinks.some(link => text.toLowerCase().includes(link));

  if (hasLinks) {
    score += 10;
    analysis.hasLinks = true;
  } else {
    recommendations.push('🔗 Include LinkedIn, GitHub, or portfolio links');
  }

  // Check for certifications (5 points)
  const certKeywords = ['certification', 'certificate', 'certified', 'credential'];
  if (certKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    score += 5;
    analysis.hasCertifications = true;
  } else {
    recommendations.push('🏆 Add relevant certifications or professional courses');
  }

  // Check for action verbs and quantifiable achievements
  const actionVerbs = ['achieved', 'developed', 'managed', 'led', 'created', 'improved',
    'increased', 'reduced', 'implemented', 'designed', 'built'];
  const verbMatches = actionVerbs.filter(verb =>
    text.toLowerCase().includes(verb)
  );

  if (verbMatches.length >= 5) {
    score += 5;
  } else {
    recommendations.push('💪 Use more action verbs (achieved, developed, managed, etc.)');
  }

  // Check for numbers and quantifiable results
  const numberRegex = /\d+%|\$\d+|increased by \d+|reduced by \d+/gi;
  const quantifiableResults = text.match(numberRegex);

  if (quantifiableResults && quantifiableResults.length >= 3) {
    score += 5;
  } else {
    recommendations.push('📊 Quantify your achievements with numbers and percentages');
  }

  // Keyword matching for common job-related terms
  const commonKeywords = ['project', 'team', 'client', 'strategic', 'analysis',
    'development', 'management', 'communication', 'leadership'];
  analysis.keywordMatches = commonKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  );

  // Check resume length
  if (analysis.wordCount < 200) {
    recommendations.push('📄 Your resume seems too short. Add more details about your experience');
  } else if (analysis.wordCount > 800) {
    recommendations.push('✂️ Consider shortening your resume. Keep it concise and relevant');
  }

  return {
    score: Math.min(score, 100),
    analysis,
    recommendations: recommendations.slice(0, 5) // Limit to top 5 recommendations
  };
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please login.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }
    req.user = user;
    next();
  });
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// ================== ROUTES ==================

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Resume Builder API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ========== AUTHENTICATION ROUTES ==========

// User Registration
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login or use a different email.'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please login.',
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account. Please try again.',
      error: error.message
    });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.fullName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in. Please try again.',
      error: error.message
    });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

// ========== RESUME ROUTES ==========

// Create New Resume
app.post('/api/resumes', authenticateToken, async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user.id
    };

    // Validate required fields
    if (!resumeData.personalInfo || !resumeData.personalInfo.fullName || !resumeData.personalInfo.email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least name and email in personal information'
      });
    }

    const resume = new Resume(resumeData);
    await resume.save();

    console.log(`✅ Resume created for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume
    });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating resume',
      error: error.message
    });
  }
});

// Get All User's Resumes
app.get('/api/resumes', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resume.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      count: resumes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: resumes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resumes',
      error: error.message
    });
  }
});

// Get Single Resume
app.get('/api/resumes/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Increment view count
    resume.viewCount += 1;
    await resume.save();

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message
    });
  }
});

// Update Resume
app.put('/api/resumes/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    console.log(`✅ Resume updated: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating resume',
      error: error.message
    });
  }
});

// Delete Resume
app.delete('/api/resumes/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Also delete associated ATS scores
    await ATSScore.deleteMany({ resumeId: req.params.id });

    console.log(`✅ Resume deleted: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message
    });
  }
});

// ========== ATS SCORE ROUTES ==========

// Upload and Check ATS Score
app.post('/api/ats-check', authenticateToken, upload.single('resume'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or DOCX)'
      });
    }

    filePath = req.file.path;
    let text = '';

    console.log(`📄 Processing file: ${req.file.originalname} (${req.file.mimetype})`);

    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (req.file.mimetype.includes('wordprocessingml') || req.file.mimetype.includes('msword')) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from the file or content is too short'
      });
    }

    // Calculate ATS score
    const { score, analysis, recommendations } = calculateATSScore(text);

    // Save ATS score to database
    const atsScore = new ATSScore({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      score: score,
      analysis: analysis,
      recommendations: recommendations
    });

    await atsScore.save();

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.log(`✅ ATS Score calculated: ${score}% for user ${req.user.email}`);

    res.json({
      success: true,
      message: 'ATS score calculated successfully',
      data: {
        id: atsScore._id,
        score: score,
        analysis: analysis,
        recommendations: recommendations,
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error('ATS check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing file and calculating ATS score',
      error: error.message
    });
  }
});

// Get All ATS Scores for User
app.get('/api/ats-scores', authenticateToken, async (req, res) => {
  try {
    const scores = await ATSScore.find({ userId: req.user.id })
      .sort({ checkedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ATS scores',
      error: error.message
    });
  }
});

// Get Single ATS Score
app.get('/api/ats-scores/:id', authenticateToken, async (req, res) => {
  try {
    const score = await ATSScore.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'ATS score not found'
      });
    }

    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ATS score',
      error: error.message
    });
  }
});

// Get User Statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const resumeCount = await Resume.countDocuments({ userId: req.user.id });
    const atsScoreCount = await ATSScore.countDocuments({ userId: req.user.id });

    const latestResume = await Resume.findOne({ userId: req.user.id })
      .sort({ updatedAt: -1 });

    const atsScores = await ATSScore.find({ userId: req.user.id });
    const averageAtsScore = atsScores.length > 0
      ? Math.round(atsScores.reduce((sum, s) => sum + s.score, 0) / atsScores.length)
      : 0;

    res.json({
      success: true,
      data: {
        resumeCount,
        atsScoreCount,
        averageAtsScore,
        latestResumeDate: latestResume ? latestResume.updatedAt : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 API URL: http://localhost:${PORT}`);
});