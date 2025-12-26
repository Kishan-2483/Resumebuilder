import React from 'react';

const CreativeTemplate = ({ formData }) => {
    // Helper function to format date from YYYY-MM to readable format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month] = dateString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto min-h-[1100px]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="grid grid-cols-3 gap-6">
                {/* Left Sidebar - Colorful */}
                <div className="col-span-1 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-xl p-6 text-white space-y-6">
                    {/* Profile Section */}
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl border-4 border-white/30">
                            👤
                        </div>
                        <h1 className="text-2xl font-bold mb-1 break-words">
                            {formData.personalInfo.fullName || 'Your Name'}
                        </h1>
                        <p className="text-sm opacity-90 font-medium">
                            {formData.experience[0]?.position || 'Professional Title'}
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 text-sm">
                        <h3 className="font-bold text-base uppercase tracking-wider border-b border-white/30 pb-2 mb-3">Contact</h3>
                        {formData.personalInfo.email && (
                            <div className="flex items-start gap-2">
                                <span className="text-lg">✉️</span>
                                <span className="break-all text-xs leading-relaxed">{formData.personalInfo.email}</span>
                            </div>
                        )}
                        {formData.personalInfo.phone && (
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📱</span>
                                <span className="text-xs">{formData.personalInfo.phone}</span>
                            </div>
                        )}
                        {formData.personalInfo.location && (
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📍</span>
                                <span className="text-xs">{formData.personalInfo.location}</span>
                            </div>
                        )}
                        {formData.personalInfo.linkedin && (
                            <div className="flex items-start gap-2">
                                <span className="text-lg">🔗</span>
                                <span className="break-all text-xs leading-relaxed">{formData.personalInfo.linkedin}</span>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-base uppercase tracking-wider border-b border-white/30 pb-2 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.filter(s => s.trim()).map((skill, idx) => (
                                <span key={idx} className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-white/30">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="col-span-2 space-y-6">
                    {/* Summary */}
                    {formData.personalInfo.summary && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                                <span className="text-2xl">💡</span>
                                About Me
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {formData.personalInfo.summary}
                            </p>
                        </div>
                    )}

                    {/* Experience */}
                    {formData.experience.length > 0 && formData.experience[0].company && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-pink-100">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                                <span className="text-2xl">💼</span>
                                Experience
                            </h2>
                            <div className="space-y-5">
                                {formData.experience.map((exp, idx) => (
                                    exp.company && (
                                        <div key={idx} className="relative pl-6 border-l-4 border-gradient-to-b from-orange-400 to-pink-400">
                                            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 border-2 border-white"></div>
                                            <div className="mb-2">
                                                <h3 className="font-bold text-gray-900 text-lg">{exp.position}</h3>
                                                <p className="text-pink-600 font-semibold text-sm">{exp.company}</p>
                                                <span className="text-gray-500 text-xs font-medium">
                                                    {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                                {exp.description}
                                            </p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {formData.education.length > 0 && formData.education[0].institution && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                                <span className="text-2xl">🎓</span>
                                Education
                            </h2>
                            <div className="space-y-4">
                                {formData.education.map((edu, idx) => (
                                    edu.institution && (
                                        <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-500">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-base">{edu.degree} in {edu.field}</h3>
                                                    <p className="text-purple-600 text-sm font-medium">{edu.institution}</p>
                                                </div>
                                                <span className="text-gray-500 text-xs font-medium whitespace-nowrap ml-2">{edu.graduationDate}</span>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreativeTemplate;
