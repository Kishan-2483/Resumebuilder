import React from 'react';

const ClassicTemplate = ({ formData }) => {
    // Helper function to format date from YYYY-MM to readable format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month] = dateString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white p-10 rounded-lg shadow-2xl max-w-4xl mx-auto min-h-[1100px]" style={{ fontFamily: 'Georgia, serif' }}>
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-6 mb-6">
                <h1 className="text-4xl font-bold text-black mb-2 tracking-tight uppercase" style={{ letterSpacing: '0.05em' }}>
                    {formData.personalInfo.fullName || 'Your Name'}
                </h1>
                <p className="text-gray-700 text-base font-normal tracking-wide">
                    {formData.experience[0]?.position || 'Professional Title'}
                </p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 text-sm text-gray-700 pb-6 border-b border-gray-300">
                {formData.personalInfo.email && (
                    <span>{formData.personalInfo.email}</span>
                )}
                {formData.personalInfo.phone && (
                    <span>•</span>
                )}
                {formData.personalInfo.phone && (
                    <span>{formData.personalInfo.phone}</span>
                )}
                {formData.personalInfo.location && (
                    <span>•</span>
                )}
                {formData.personalInfo.location && (
                    <span>{formData.personalInfo.location}</span>
                )}
                {formData.personalInfo.linkedin && (
                    <span>•</span>
                )}
                {formData.personalInfo.linkedin && (
                    <span>{formData.personalInfo.linkedin}</span>
                )}
            </div>

            {/* Summary */}
            {formData.personalInfo.summary && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-black mb-3 uppercase border-b border-black pb-1">
                        Professional Summary
                    </h2>
                    <p className="text-gray-800 leading-relaxed text-sm text-justify" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {formData.personalInfo.summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {formData.experience.length > 0 && formData.experience[0].company && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-black mb-4 uppercase border-b border-black pb-1">
                        Professional Experience
                    </h2>
                    <div className="space-y-5">
                        {formData.experience.map((exp, idx) => (
                            exp.company && (
                                <div key={idx}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-black text-base">{exp.position}</h3>
                                        <span className="text-gray-600 text-xs italic">
                                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 font-semibold text-sm mb-2 italic">{exp.company}</p>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Times New Roman, serif' }}>
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
                    <h2 className="text-xl font-bold text-black mb-4 uppercase border-b border-black pb-1">
                        Education
                    </h2>
                    <div className="space-y-4">
                        {formData.education.map((edu, idx) => (
                            edu.institution && (
                                <div key={idx}>
                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <h3 className="font-bold text-black text-base">{edu.degree} in {edu.field}</h3>
                                            <p className="text-gray-700 text-sm italic">{edu.institution}</p>
                                        </div>
                                        <span className="text-gray-600 text-xs">{edu.graduationDate}</span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-black mb-4 uppercase border-b border-black pb-1">
                    Skills
                </h2>
                <div className="text-gray-800 text-sm leading-relaxed">
                    {formData.skills.filter(s => s.trim()).join(' • ')}
                </div>
            </div>
        </div>
    );
};

export default ClassicTemplate;
