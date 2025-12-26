const mongoose = require('mongoose');

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

module.exports = mongoose.model('ATSScore', atsScoreSchema);
