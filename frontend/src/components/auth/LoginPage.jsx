import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(e, formData);
    };

    return (
        <div className="min-h-screen mesh-bg flex items-center justify-center py-12 px-4 relative overflow-hidden selection:bg-brand-200">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-brand-200 to-indigo-200 opacity-30 blur-[100px] animate-float"></div>
                <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-brand-100 to-emerald-100 opacity-30 blur-[80px] animate-pulse"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="glass bg-white/80 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-700 border-white/60">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 mb-6 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                            <span className="text-4xl">🚀</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-medium">Your professional journey continues here</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-50/50 transition-all outline-none font-semibold text-slate-900 placeholder:text-slate-300 shadow-sm"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1 ml-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors">Recover? </button>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-50/50 transition-all outline-none font-semibold text-slate-900 placeholder:text-slate-300 shadow-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-brand-600 hover:shadow-brand-200 hover:-translate-y-1 transition-all duration-300"
                        >
                            Get Started
                        </button>
                    </form>

                    <div className="mt-10 text-center pt-8 border-t border-slate-100">
                        <p className="text-slate-500 font-medium">
                            New here?{' '}
                            <Link
                                to="/signup"
                                className="text-brand-600 font-black hover:text-brand-700 transition-colors border-b-2 border-brand-100 pb-0.5"
                            >
                                Create Free Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
