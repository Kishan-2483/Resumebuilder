const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const ATSScore = require('../models/ATSScore');
const authenticateToken = require('../middleware/auth');

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
function calculateATSScore(text) {
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

    analysis.wordCount = text.split(/\s+/).length;

    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;

    if (emailRegex.test(text) && phoneRegex.test(text)) {
        score += 15;
        analysis.hasContactInfo = true;
    } else {
        recommendations.push('✉️ Add complete contact information (email and phone number)');
    }

    const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
    const hasSummarySection = summaryKeywords.some(keyword => text.toLowerCase().includes(keyword));

    if (hasSummarySection) {
        const summaryMatch = text.match(new RegExp(`(${summaryKeywords.join('|')})`, 'i'));
        if (summaryMatch && text.length > summaryMatch.index + 100) {
            score += 15;
            analysis.hasSummary = true;
        }
    }
    if (!analysis.hasSummary) recommendations.push('📝 Include a compelling professional summary at the top');

    const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience'];
    const hasExperience = experienceKeywords.some(keyword => text.toLowerCase().includes(keyword));

    if (hasExperience) {
        const jobIndicators = text.match(/\d{4}\s*[-–]\s*(\d{4}|present|current)/gi);
        analysis.experienceCount = jobIndicators ? jobIndicators.length : 1;
        if (analysis.experienceCount >= 2) score += 20;
        else if (analysis.experienceCount === 1) {
            score += 15;
            recommendations.push('💼 Add more work experience entries to strengthen your profile');
        }
    } else {
        recommendations.push('💼 Add your work experience with specific dates and achievements');
    }

    const educationKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd'];
    if (educationKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        score += 15;
        analysis.educationCount = 1;
    } else {
        recommendations.push('🎓 Include your educational background');
    }

    const skillsKeywords = ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies'];
    const hasSkills = skillsKeywords.some(keyword => text.toLowerCase().includes(keyword));

    if (hasSkills) {
        const skillsMatch = text.match(new RegExp(`(${skillsKeywords.join('|')})[:\\s]+([^]*?)(?:\\n\\n|\\n[A-Z])`, 'i'));
        if (skillsMatch) {
            const skillsText = skillsMatch[2];
            const commaCount = (skillsText.match(/,/g) || []).length;
            const bulletCount = (skillsText.match(/•|·|-/g) || []).length;
            analysis.skillsCount = Math.max(commaCount + 1, bulletCount);
            if (analysis.skillsCount >= 8) score += 20;
            else if (analysis.skillsCount >= 5) score += 15;
            else score += 10;
        }
    } else {
        recommendations.push('🎯 Add a comprehensive skills section with relevant keywords');
    }

    const socialLinks = ['linkedin.com', 'github.com', 'portfolio', 'website'];
    if (socialLinks.some(link => text.toLowerCase().includes(link))) {
        score += 10;
        analysis.hasLinks = true;
    } else recommendations.push('🔗 Include LinkedIn, GitHub, or portfolio links');

    if (['certification', 'certificate', 'certified', 'credential'].some(keyword => text.toLowerCase().includes(keyword))) {
        score += 5;
        analysis.hasCertifications = true;
    } else recommendations.push('🏆 Add relevant certifications or professional courses');

    return {
        score: Math.min(score, 100),
        analysis,
        recommendations: recommendations.slice(0, 5)
    };
}

// Resumes CRUD
router.post('/', authenticateToken, async (req, res) => {
    try {
        const resume = new Resume({ ...req.body, userId: req.user.id });
        await resume.save();
        res.status(201).json({ success: true, message: 'Resume created successfully', data: resume });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating resume', error: error.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const resumes = await Resume.find({ userId: req.user.id })
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Resume.countDocuments({ userId: req.user.id });
        res.json({ success: true, count: resumes.length, total, page, pages: Math.ceil(total / limit), data: resumes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching resumes', error: error.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
        resume.viewCount += 1;
        await resume.save();
        res.json({ success: true, data: resume });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching resume', error: error.message });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const resume = await Resume.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
        res.json({ success: true, message: 'Resume updated successfully', data: resume });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating resume', error: error.message });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
        await ATSScore.deleteMany({ resumeId: req.params.id });
        res.json({ success: true, message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting resume', error: error.message });
    }
});

// ATS score routes
router.post('/ats-check', authenticateToken, upload.single('resume'), async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a resume file' });
        filePath = req.file.path;
        let text = '';
        if (req.file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(fs.readFileSync(filePath));
            text = pdfData.text;
        } else if (req.file.mimetype.includes('wordprocessingml') || req.file.mimetype.includes('msword')) {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        }
        if (!text || text.trim().length < 50) return res.status(400).json({ success: false, message: 'Text too short' });
        const { score, analysis, recommendations } = calculateATSScore(text);
        const atsScore = new ATSScore({
            userId: req.user.id,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            score,
            analysis,
            recommendations
        });
        await atsScore.save();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json({ success: true, data: { id: atsScore._id, score, analysis, recommendations } });
    } catch (error) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ success: false, message: 'Error calculating ATS score', error: error.message });
    }
});

router.get('/ats-scores', authenticateToken, async (req, res) => {
    try {
        const scores = await ATSScore.find({ userId: req.user.id }).sort({ checkedAt: -1 }).limit(50);
        res.json({ success: true, count: scores.length, data: scores });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching ATS scores', error: error.message });
    }
});

router.get('/ats-scores/:id', authenticateToken, async (req, res) => {
    try {
        const score = await ATSScore.findOne({ _id: req.params.id, userId: req.user.id });
        if (!score) return res.status(404).json({ success: false, message: 'ATS score not found' });
        res.json({ success: true, data: score });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching ATS score', error: error.message });
    }
});

// Stats route
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const resumeCount = await Resume.countDocuments({ userId: req.user.id });
        const atsScoreCount = await ATSScore.countDocuments({ userId: req.user.id });
        const latestResume = await Resume.findOne({ userId: req.user.id }).sort({ updatedAt: -1 });
        const atsScores = await ATSScore.find({ userId: req.user.id });
        const averageAtsScore = atsScores.length > 0
            ? Math.round(atsScores.reduce((sum, s) => sum + s.score, 0) / atsScores.length)
            : 0;
        res.json({ success: true, data: { resumeCount, atsScoreCount, averageAtsScore, latestResumeDate: latestResume ? latestResume.updatedAt : null } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
    }
});

module.exports = router;
