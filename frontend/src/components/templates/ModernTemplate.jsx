import React from 'react';

const ModernTemplate = ({ formData }) => {
    // Helper function to format date from YYYY-MM to readable format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month] = dateString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl mx-auto min-h-[1100px]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="border-l-4 border-blue-600 pl-6 mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">{formData.personalInfo.fullName || 'Your Name'}</h1>
                <p className="text-blue-600 text-lg font-medium tracking-wide uppercase">{formData.experience[0]?.position || 'Professional Title'}</p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-y-2 gap-x-6 mb-8 text-sm text-gray-600 border-b border-gray-100 pb-6">
                {formData.personalInfo.email && (
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600">✉️</span>
                        <span>{formData.personalInfo.email}</span>
                    </div>
                )}
                {formData.personalInfo.phone && (
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600">📱</span>
                        <span>{formData.personalInfo.phone}</span>
                    </div>
                )}
                {formData.personalInfo.location && (
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600">📍</span>
                        <span>{formData.personalInfo.location}</span>
                    </div>
                )}
                {formData.personalInfo.linkedin && (
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600">🔗</span>
                        <span>{formData.personalInfo.linkedin}</span>
                    </div>
                )}
            </div>

            {/* Summary */}
            {formData.personalInfo.summary && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                        Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-sm text-justify">
                        {formData.personalInfo.summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {formData.experience.length > 0 && formData.experience[0].company && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                        Experience
                    </h2>
                    <div className="space-y-6">
                        {formData.experience.map((exp, idx) => (
                            exp.company && (
                                <div key={idx} className="relative pl-4 border-l-2 border-gray-100">
                                    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-blue-600"></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{exp.position}</h3>
                                            <p className="text-blue-600 font-medium">{exp.company}</p>
                                        </div>
                                        <span className="text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100 font-medium whitespace-nowrap">
                                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mt-2 whitespace-pre-line">
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
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                        Education
                    </h2>
                    <div className="grid gap-4">
                        {formData.education.map((edu, idx) => (
                            edu.institution && (
                                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{edu.degree} in {edu.field}</h3>
                                            <p className="text-blue-600 text-sm">{edu.institution}</p>
                                        </div>
                                        <span className="text-gray-500 text-xs font-medium">{edu.graduationDate}</span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                    Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                    {formData.skills.filter(s => s.trim()).map((skill, idx) => (
                        <span key={idx} className="bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModernTemplate;
