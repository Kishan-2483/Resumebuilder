import React, { useState, useRef, useEffect } from 'react';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import CreativeTemplate from './templates/CreativeTemplate';

const BuilderPage = ({ currentUser }) => {
    const [template, setTemplate] = useState('modern');
    const [showPreview, setShowPreview] = useState(false);
    const [atsScore, setAtsScore] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const fileInputRef = useRef(null);
    const uploadInputRef = useRef(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/resumes/files', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUploadedFiles(data.data);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    // Helper function to format date from YYYY-MM to readable format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month] = dateString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

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
        if (!file) return;

        setIsUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to upload files');
                return;
            }

            const response = await fetch('/api/resumes/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ File uploaded successfully!');
                fetchFiles();
            } else {
                alert(`❌ Upload failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('❌ Network error during upload');
        } finally {
            setIsUploading(false);
            if (uploadInputRef.current) uploadInputRef.current.value = '';
        }
    };

    const handleFileDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/resumes/files/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                fetchFiles();
            } else {
                alert(`❌ Delete failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleFileDownload = async (file) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/resumes/files/download/${file._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.originalname;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert('❌ Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const handleFileAnalyze = async (file) => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/resumes/files/${file._id}/analyze`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setAnalysisResult(data.data);
                // Also update the global atsScore state if we want to show it in the primary display
                setAtsScore(data.data.score);
            } else {
                alert(`❌ Analysis failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            alert('❌ Network error during analysis');
        } finally {
            setIsAnalyzing(false);
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

            const response = await fetch('/api/resumes', {
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
        <div className="min-h-screen mesh-bg pt-28 pb-20 selection:bg-brand-200">
            {/* Visual Mode Toggle & Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Design Workspace</h1>
                        <p className="text-slate-500 font-medium">Crafting your professional identity</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
                        <button
                            onClick={() => setShowPreview(false)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!showPreview ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-white'}`}
                        >
                            ✏️ Editor
                        </button>
                        <button
                            onClick={() => setShowPreview(true)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${showPreview ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white'}`}
                        >
                            👁️ Preview
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={saveToDatabase}
                            disabled={isSaving}
                            className={`group flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-bold shadow-xl transition-all duration-300 ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-brand-600 transform hover:-translate-y-1'}`}
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin text-xl">⌛</span>
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <span className="group-hover:rotate-12 transition-transform">💾</span>
                                    <span>Save & Deploy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showPreview ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in duration-500">
                    <div className="glass p-4 rounded-2xl mb-8 flex justify-between items-center sticky top-28 z-30">
                        <div className="flex items-center gap-4 pl-4">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Live Document Preview</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => downloadResume('pdf')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white font-bold transition-all duration-300"
                            >
                                <span>📄</span> PDF Export
                            </button>
                        </div>
                    </div>
                    <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/50 bg-white">
                        {template === 'modern' && <ModernTemplate formData={formData} />}
                        {template === 'classic' && <ClassicTemplate formData={formData} />}
                        {template === 'creative' && <CreativeTemplate formData={formData} />}
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Editor Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Templates */}
                        <div className="glass rounded-[2rem] p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="text-2xl">✨</span> Templates
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {['modern', 'classic', 'creative'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTemplate(t)}
                                        className={`group flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${template === t
                                            ? 'border-brand-500 bg-brand-50/50 text-brand-700 shadow-lg shadow-brand-100'
                                            : 'border-white bg-white/50 text-slate-600 hover:border-brand-200 hover:bg-white'
                                            }`}
                                    >
                                        <span className="capitalize font-bold text-lg">{t}</span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${template === t ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-200 group-hover:border-brand-300'}`}>
                                            {template === t && <span className="text-xs">✓</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Functionality: ATS Score */}
                        <div className="glass rounded-[2rem] p-8 border-brand-100 bg-gradient-to-br from-white/80 to-brand-50/50">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="text-2xl">📊</span> ATS Intelligence
                            </h3>

                            <button
                                onClick={() => {
                                    const score = calculateATS(formData);
                                    setAtsScore(score);
                                }}
                                className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-brand-600 transition-all duration-300 font-bold shadow-xl shadow-slate-200 mb-6 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Analyze Performance
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </button>

                            {atsScore !== null && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Optimization Score</p>
                                            <span className={`text-5xl font-black ${atsScore >= 70 ? 'text-brand-600' : 'text-orange-500'}`}>{atsScore}<span className="text-xl opacity-40">/100</span></span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${atsScore >= 70 ? 'bg-brand-500' : 'bg-orange-500'}`} style={{ width: `${atsScore}%` }}></div>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500 leading-relaxed italic">
                                        {atsScore >= 70 ? '"Excellent clarity and structure. You\'re in the top 5% of candidates."' : '"Missing key impact metrics. Add more achievements to stand out."'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Document Manager */}
                        <div className="glass rounded-[2rem] p-8 border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="text-2xl">📂</span> My Documents
                            </h3>

                            <div className="space-y-4">
                                <input
                                    type="file"
                                    ref={uploadInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                />
                                <button
                                    onClick={() => uploadInputRef.current.click()}
                                    disabled={isUploading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-50 text-brand-700 rounded-2xl hover:bg-brand-100 transition-all duration-300 font-bold border-2 border-brand-200 border-dashed"
                                >
                                    {isUploading ? '📤 Uploading...' : '➕ Upload Resource'}
                                </button>

                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {uploadedFiles.length === 0 ? (
                                        <p className="text-center text-slate-400 py-4 font-medium text-sm italic">
                                            No documents uploaded yet
                                        </p>
                                    ) : (
                                        uploadedFiles.map((file) => (
                                            <div key={file._id} className="p-4 bg-white/50 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-brand-300 hover:bg-white transition-all shadow-sm">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <span className="text-xl">📄</span>
                                                    <div className="overflow-hidden">
                                                        <p className="font-bold text-slate-700 text-sm truncate">{file.originalname}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                                                            {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleFileAnalyze(file)}
                                                        disabled={isAnalyzing}
                                                        className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                                                        title="Analyze ATS Score"
                                                    >
                                                        {isAnalyzing ? '...' : '🔍'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleFileDownload(file)}
                                                        className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                                        title="Download"
                                                    >
                                                        ⬇️
                                                    </button>
                                                    <button
                                                        onClick={() => handleFileDelete(file._id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {analysisResult && (
                                    <div className="mt-6 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-black text-emerald-900 text-sm flex items-center gap-2">
                                                <span>🎯</span> Analysis Result
                                            </h4>
                                            <button
                                                onClick={() => setAnalysisResult(null)}
                                                className="text-emerald-400 hover:text-emerald-600 font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="flex items-end gap-3 mb-4">
                                            <span className="text-4xl font-black text-emerald-600">{analysisResult.score}</span>
                                            <span className="text-sm font-bold text-emerald-400 mb-1">/ 100</span>
                                        </div>
                                        <div className="space-y-2">
                                            {analysisResult.recommendations.map((rec, i) => (
                                                <p key={i} className="text-xs font-medium text-emerald-700 leading-relaxed">• {rec}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Personal Info */}
                        <div className="glass rounded-[2rem] p-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">👤</div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Personal Brand</h2>
                                    <p className="text-slate-500 font-medium">Your primary identification details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: "Full Name", field: "fullName", type: "text", placeholder: "John Doe" },
                                    { label: "Professional Email", field: "email", type: "email", placeholder: "john@example.com" },
                                    { label: "Phone Number", field: "phone", type: "tel", placeholder: "+1 234 567 890" },
                                    { label: "Office/Location", field: "location", type: "text", placeholder: "New York, USA" }
                                ].map((input) => (
                                    <div key={input.field} className="group space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{input.label}</label>
                                        <input
                                            type={input.type}
                                            placeholder={input.placeholder}
                                            value={formData.personalInfo[input.field]}
                                            onChange={(e) => handleInputChange('personalInfo', input.field, e.target.value)}
                                            className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-50/50 transition-all outline-none font-semibold text-slate-900 placeholder:text-slate-300 shadow-sm"
                                        />
                                    </div>
                                ))}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Professional Impact Statement</label>
                                    <textarea
                                        placeholder="Briefly describe your core expertise and what you bring to the table..."
                                        value={formData.personalInfo.summary}
                                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                                        rows="4"
                                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-50/50 transition-all outline-none font-semibold text-slate-900 placeholder:text-slate-300 shadow-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="glass rounded-[2rem] p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">💼</div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Career History</h2>
                                        <p className="text-slate-500 font-medium">Your journey through different roles</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => addSection('experience')}
                                    className="px-5 py-2.5 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white font-bold text-sm transition-all duration-300 shadow-sm"
                                >
                                    + Add Role
                                </button>
                            </div>

                            <div className="space-y-8">
                                {formData.experience.map((exp, idx) => (
                                    <div key={idx} className="p-8 bg-white/50 border-2 border-slate-100 rounded-[2rem] relative group hover:border-brand-200 hover:bg-white transition-all duration-500 shadow-sm">
                                        <button
                                            onClick={() => removeSection('experience', idx)}
                                            className="absolute -top-3 -right-3 w-10 h-10 bg-white shadow-lg rounded-full text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all z-10 border border-slate-100"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input
                                                type="text"
                                                placeholder="Company Name"
                                                value={exp.company}
                                                onChange={(e) => handleInputChange('experience', 'company', e.target.value, idx)}
                                                className="px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Job Title"
                                                value={exp.position}
                                                onChange={(e) => handleInputChange('experience', 'position', e.target.value, idx)}
                                                className="px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-900"
                                            />
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Period From</label>
                                                <input
                                                    type="month"
                                                    value={exp.startDate}
                                                    onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, idx)}
                                                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-900"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Period To</label>
                                                <input
                                                    type="month"
                                                    value={exp.endDate}
                                                    onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, idx)}
                                                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-900"
                                                />
                                            </div>
                                            <textarea
                                                placeholder="What were your key achievements? Use action verbs (e.g., Developed, Managed, Scaled...)"
                                                value={exp.description}
                                                onChange={(e) => handleInputChange('experience', 'description', e.target.value, idx)}
                                                rows="3"
                                                className="md:col-span-2 px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-semibold text-slate-800 resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="glass rounded-[2rem] p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">💡</div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Expertise</h2>
                                        <p className="text-slate-500 font-medium">Core skills and technical stack</p>
                                    </div>
                                </div>
                                <button
                                    onClick={addSkill}
                                    className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white font-bold text-sm transition-all duration-300 shadow-sm"
                                >
                                    + Add Skill
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="flex gap-2 group relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. JavaScript"
                                            value={skill}
                                            onChange={(e) => handleSkillChange(idx, e.target.value)}
                                            className="flex-1 px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all font-bold text-slate-900"
                                        />
                                        <button
                                            onClick={() => removeSkill(idx)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="glass rounded-[2rem] p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎓</div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Education</h2>
                                        <p className="text-slate-500 font-medium">Academic background and credentials</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => addSection('education')}
                                    className="px-5 py-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white font-bold text-sm transition-all duration-300 shadow-sm"
                                >
                                    + Add Education
                                </button>
                            </div>
                            <div className="space-y-8">
                                {formData.education.map((edu, idx) => (
                                    <div key={idx} className="p-8 bg-white/50 border-2 border-slate-100 rounded-[2rem] relative group hover:border-brand-200 hover:bg-white transition-all duration-500 shadow-sm">
                                        <button
                                            onClick={() => removeSection('education', idx)}
                                            className="absolute -top-3 -right-3 w-10 h-10 bg-white shadow-lg rounded-full text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all z-10 border border-slate-100"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input
                                                type="text"
                                                placeholder="Institution / University"
                                                value={edu.institution}
                                                onChange={(e) => handleInputChange('education', 'institution', e.target.value, idx)}
                                                className="px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Degree / Major"
                                                value={edu.degree}
                                                onChange={(e) => handleInputChange('education', 'degree', e.target.value, idx)}
                                                className="px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Field of Study"
                                                value={edu.field}
                                                onChange={(e) => handleInputChange('education', 'field', e.target.value, idx)}
                                                className="px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Graduation Year"
                                                value={edu.graduationDate}
                                                onChange={(e) => handleInputChange('education', 'graduationDate', e.target.value, idx)}
                                                className="px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-900"
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
