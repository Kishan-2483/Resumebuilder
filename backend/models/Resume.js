const mongoose = require('mongoose');

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

module.exports = mongoose.model('Resume', resumeSchema);
