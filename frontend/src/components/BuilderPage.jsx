import React, { useState, useRef } from 'react';
import ModernTemplate from './templates/ModernTemplate';

const BuilderPage = ({ currentUser }) => {
    const [template, setTemplate] = useState('modern');
    const [showPreview, setShowPreview] = useState(false);
    const [atsScore, setAtsScore] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        personalInfo: {
            fullName: currentUser?.name || '',
            email: currentUser?.email || '',
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
            // Simulation of ATS checking
            const score = calculateATS(formData);
            setAtsScore(score);
        }
    };

    const saveToDatabase = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            // If no token in localStorage, try checking if parent passed user (though token is needed for API)
            if (!token) {
                alert('You are not logged in. Please log in to save.');
                setIsSaving(false);
                return;
            }

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
                alert('✅ Resume saved successfully to your account!');
            } else {
                const data = await response.json();
                alert(`❌ Error saving: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('❌ Network error. Check if backend is running.');
        } finally {
            setIsSaving(false);
        }
    };

    const downloadResume = (format) => {
        alert(`Resume would be downloaded as ${format.toUpperCase()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">

            {/* Visual Mode Toggle */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>

                <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setShowPreview(false)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!showPreview ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        ✏️ Editor
                    </button>
                    <button
                        onClick={() => setShowPreview(true)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${showPreview ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        👁️ Preview
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={saveToDatabase}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg shadow-md transition-all ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin">⌛</span> Saving...
                            </>
                        ) : (
                            <>
                                <span>💾</span> Save Resume
                            </>
                        )}
                    </button>
                </div>
            </div>

            {showPreview ? (
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-end gap-3 sticky top-24 z-30">
                        <span className="text-sm font-medium text-gray-500 self-center mr-auto">Standard PDF/DOCX Export</span>
                        <button
                            onClick={() => downloadResume('pdf')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors"
                        >
                            <span>📄</span> PDF
                        </button>
                        <button
                            onClick={() => downloadResume('docx')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                        >
                            <span>📝</span> DOCX
                        </button>
                    </div>
                    <ModernTemplate formData={formData} />
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Templates */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Template</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {['modern', 'classic', 'creative'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTemplate(t)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${template === t
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="capitalize font-medium">{t}</span>
                                        {template === t && <span className="text-blue-500">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Functionality: ATS Score */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span>📊</span> ATS Optimizer
                            </h3>

                            <button
                                onClick={() => {
                                    const score = calculateATS(formData);
                                    setAtsScore(score);
                                }}
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md mb-4"
                            >
                                Check My Score
                            </button>

                            {atsScore !== null && (
                                <div className="animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-gray-600">Current Score</span>
                                        <span className={`text-2xl font-bold ${atsScore >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{atsScore}/100</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                        <div className={`h-2.5 rounded-full transition-all duration-1000 ${atsScore >= 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${atsScore}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {atsScore >= 70 ? 'Generaly Good! Ready for application.' : 'Missing key sections. Add Experience, Skills, and Summary.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-lg">👤</span>
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.personalInfo.fullName}
                                        onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.personalInfo.email}
                                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.personalInfo.phone}
                                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.personalInfo.location}
                                        onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Professional Summary</label>
                                    <textarea
                                        value={formData.personalInfo.summary}
                                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-y"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-purple-100 text-purple-600 p-2 rounded-lg text-lg">💼</span>
                                    Experience
                                </h2>
                                <button
                                    onClick={() => addSection('experience')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                                >
                                    <span>➕</span> Add Position
                                </button>
                            </div>

                            <div className="space-y-6">
                                {formData.experience.map((exp, idx) => (
                                    <div key={idx} className="p-5 bg-gray-50/50 border border-gray-200 rounded-xl relative group hover:border-purple-200 transition-colors">
                                        <button
                                            onClick={() => removeSection('experience', idx)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm"
                                            title="Remove"
                                        >
                                            Trash
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Company Name"
                                                value={exp.company}
                                                onChange={(e) => handleInputChange('experience', 'company', e.target.value, idx)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Job Title"
                                                value={exp.position}
                                                onChange={(e) => handleInputChange('experience', 'position', e.target.value, idx)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Start Date"
                                                value={exp.startDate}
                                                onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, idx)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="End Date"
                                                value={exp.endDate}
                                                onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, idx)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                            <textarea
                                                placeholder="Job Description & Achievements"
                                                value={exp.description}
                                                onChange={(e) => handleInputChange('experience', 'description', e.target.value, idx)}
                                                rows="3"
                                                className="md:col-span-2 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-green-100 text-green-600 p-2 rounded-lg text-lg">💡</span>
                                    Skills
                                </h2>
                                <button
                                    onClick={addSkill}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                                >
                                    <span>➕</span> Add Skill
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="flex gap-2 group">
                                        <input
                                            type="text"
                                            placeholder="e.g. JavaScript, Project Management"
                                            value={skill}
                                            onChange={(e) => handleSkillChange(idx, e.target.value)}
                                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={() => removeSkill(idx)}
                                            className="text-gray-400 hover:text-red-500 px-2 opacity-50 group-hover:opacity-100 transition-all"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-orange-100 text-orange-600 p-2 rounded-lg text-lg">🎓</span>
                                    Education
                                </h2>
                                <button
                                    onClick={() => addSection('education')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                                >
                                    <span>➕</span> Add Education
                                </button>
                            </div>
                            <div className="space-y-6">
                                {formData.education.map((edu, idx) => (
                                    <div key={idx} className="p-5 bg-gray-50/50 border border-gray-200 rounded-xl relative group hover:border-orange-200 transition-colors">
                                        <button
                                            onClick={() => removeSection('education', idx)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm"
                                            title="Remove"
                                        >
                                            Trash
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Institution / University"
                                                value={edu.institution}
                                                onChange={(e) => handleInputChange('education', 'institution', e.target.value, idx)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Degree / Major"
                                                value={edu.degree}
                                                onChange={(e) => handleInputChange('education', 'degree', e.target.value, idx)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Field of Study"
                                                value={edu.field}
                                                onChange={(e) => handleInputChange('education', 'field', e.target.value, idx)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Graduation Year"
                                                value={edu.graduationDate}
                                                onChange={(e) => handleInputChange('education', 'graduationDate', e.target.value, idx)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default BuilderPage;
