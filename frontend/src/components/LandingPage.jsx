import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen mesh-bg selection:bg-brand-200">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-32">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-brand-200/40 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }}></div>
                    <div className="absolute bottom-[10%] left-[20%] w-64 h-64 bg-purple-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="text-brand-600 font-bold text-sm tracking-wider uppercase">✨ Next Gen Resume Builder</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1] tracking-tighter max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">Career Path</span>
                        </h1>

                        <p className="text-xl text-slate-600 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                            Stop struggling with formatting. Use our AI-powered engine to build resumes that land jobs at Fortune 500 companies.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-brand-600 hover:shadow-brand-300 transition-all duration-500 transform hover:-translate-y-2 flex items-center gap-3"
                            >
                                Start Building Now
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-10 py-5 glass text-slate-700 rounded-2xl font-bold text-lg hover:bg-white transition-all duration-500 transform hover:-translate-y-1"
                            >
                                Learn More
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="pt-20 border-t border-slate-200/50 w-full max-w-4xl">
                            <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mb-10 uppercase">Trusted by Candidates at</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000 items-center">
                                {['Google', 'Airbnb', 'Spotify', 'Amazon', 'Tesla'].map((company) => (
                                    <span key={company} className="text-2xl font-black text-slate-900 select-none tracking-tighter">{company}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-brand-600 font-black tracking-widest text-sm uppercase mb-4">Core Engine</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Designed for Impact</h3>
                        <p className="text-lg text-slate-600 font-medium">
                            Every feature is meticulously crafted to give you a competitive edge in the job market.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: "🚀",
                                title: "AI Generation",
                                desc: "Smart layout engine that adapts to your content and highlights your strengths automatically.",
                                color: "brand"
                            },
                            {
                                icon: "🎯",
                                title: "ATS Check",
                                desc: "Real-time industry-standard scanning ensuring your resume never gets lost in the pile.",
                                color: "indigo"
                            },
                            {
                                icon: "💎",
                                title: "Premium Templates",
                                desc: "Designed by expert career coaches and recruiters for maximum readability and conversion.",
                                color: "purple"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group glass p-10 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:-translate-y-4 transition-all duration-700">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    {feature.icon}
                                </div>
                                <h4 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/20 to-purple-600/20"></div>
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Ready to Land Your <br /><span className="text-brand-400 font-black italic">Next Big Role?</span></h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">Join over 50,000 professionals who transformed their careers using our platform.</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-10 py-5 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-400 transition-all duration-300 shadow-xl shadow-brand-500/20"
                        >
                            Get Started Instantly
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">📄</div>
                        <span className="text-xl font-black tracking-tighter">RESUMEPRO</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-4 italic">Crafted with ❤️ for career growth.</p>
                    <p className="text-slate-400 text-xs">© 2025 ResumePro Edition. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};


export default LandingPage;
