import React from 'react';

const LandingPage = ({ setCurrentPage }) => (
    <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-white">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-70"></div>
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-b from-purple-50 to-transparent rounded-full blur-3xl opacity-60 transform translate-x-1/4 -translate-y-1/4"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center pt-16">
                    <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 shadow-sm">
                            <span className="animate-pulse text-blue-600">✨</span>
                            <span className="text-blue-700 font-semibold text-sm tracking-wide">AI-Powered Resume Builder</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                            Build Your <br />
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Dream Career</span>
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                            Create professional, ATS-optimized resumes in minutes. Join thousands of professionals landing interviews at top companies.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => setCurrentPage('signup')}
                                className="group relative px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold text-lg shadow-xl shadow-gray-200 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center gap-2">
                                    Get Started Free
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-all hover:border-gray-300"
                            >
                                Learn More
                            </button>
                        </div>

                        <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200`}>
                                        User
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-gray-900">Trusted by 10,000+</p>
                                <p className="text-gray-500">Job seekers worldwide</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative lg:h-[600px] flex items-center justify-center animate-in slide-in-from-right-4 duration-1000">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-[3rem] transform rotate-3 scale-95 blur-2xl opacity-60"></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 transform -rotate-2 hover:rotate-0 transition-transform duration-500 w-full max-w-md">
                            <div className="bg-gray-50 rounded-xl overflow-hidden aspect-[3/4] relative">
                                {/* Mock UI for Resume */}
                                <div className="p-8 space-y-6 opacity-80">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-6"></div>
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                    <div className="border-t border-gray-200 pt-6 space-y-3">
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="h-20 bg-blue-50 rounded-lg"></div>
                                        <div className="h-20 bg-purple-50 rounded-lg"></div>
                                    </div>
                                </div>

                                {/* Floating Cards */}
                                <div className="absolute top-10 right-4 bg-white p-4 rounded-xl shadow-lg border border-green-100 flex items-center gap-3 animate-bounce shadow-green-100">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        ✓
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">ATS Score</p>
                                        <p className="font-bold text-green-600">98/100</p>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        💼
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Interviews</p>
                                        <p className="font-bold text-gray-900">+300%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Why Choose Us</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Everything You Need to Succeed</h3>
                    <p className="text-lg text-gray-600">
                        Our platform provides powerful tools designed to help you build a resume that stands out and passes ATS filters.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: "⚡",
                            title: "Lightning Fast",
                            desc: "Create a professional resume in under 10 minutes with our easy-to-use builder.",
                            color: "blue"
                        },
                        {
                            icon: "🎯",
                            title: "ATS Optimized",
                            desc: "Real-time feedback ensures your resume is readable by Applicant Tracking Systems.",
                            color: "purple"
                        },
                        {
                            icon: "🎨",
                            title: "Premium Designs",
                            desc: "Choose from a collection of modern, professionally designed templates.",
                            color: "pink"
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="group p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 bg-${feature.color}-50 text-${feature.color}-600 group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-gray-500 font-medium mb-8">TRUSTED BY PROFESSIONALS AT</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'].map((company) => (
                        <span key={company} className="text-2xl font-bold text-gray-400 hover:text-gray-900 cursor-default">{company}</span>
                    ))}
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-2xl">📄</span>
                            <span className="text-xl font-bold">ResumeBuilder Pro</span>
                        </div>
                        <p className="text-gray-400 max-w-sm">
                            Empowering professionals to advance their careers with cutting-edge resume building technology.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-gray-200">Product</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-colors">Features</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Templates</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-gray-200">Legal</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Terms</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
                    <p>© 2024 ResumeBuilder Pro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
);

export default LandingPage;
