import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, currentUser, handleLogout }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navLinkClass = ({ isActive }) =>
        `text-sm font-semibold transition-all duration-300 px-4 py-2 rounded-xl flex items-center gap-2 ${isActive
            ? 'text-brand-600 bg-brand-50/50'
            : 'text-slate-600 hover:text-brand-600 hover:bg-white/50'
        }`;

    return (
        <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="glass rounded-2xl px-6 py-3 flex justify-between items-center h-16 transition-all duration-500 hover:shadow-2xl">
                    {/* Logo */}
                    <Link
                        to={isAuthenticated ? '/builder' : '/'}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl shadow-lg shadow-brand-200 group-hover:shadow-brand-400 group-hover:scale-110 transition-all duration-500 flex items-center justify-center">
                            <span className="text-white text-xl">📄</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors duration-300">
                                RESUME<span className="text-brand-500">PRO</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        <NavLink to="/" className={navLinkClass} end>
                            Home
                        </NavLink>

                        {isAuthenticated ? (
                            <>
                                <NavLink to="/builder" className={navLinkClass}>
                                    Builder
                                </NavLink>
                                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 pl-2">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                            <span className="text-xs font-bold text-brand-700">{currentUser?.name?.charAt(0) || 'U'}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 hidden lg:block">
                                            {currentUser?.name || 'User'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4 ml-4">
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-200 transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                            <span className={`block h-0.5 bg-slate-800 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`block h-0.5 bg-slate-800 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block h-0.5 bg-slate-800 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-2">
                    <div className="glass rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-300">
                        {!isAuthenticated ? (
                            <>
                                <NavLink
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl"
                                    end
                                >
                                    Home
                                </NavLink>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-slate-600 font-semibold text-center border border-slate-200 rounded-xl"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 bg-brand-600 text-white font-bold text-center rounded-xl shadow-lg shadow-brand-100"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-xl">👤</div>
                                    <div>
                                        <p className="font-bold text-slate-900">{currentUser?.name}</p>
                                        <p className="text-xs text-slate-500">{currentUser?.email}</p>
                                    </div>
                                </div>
                                <NavLink
                                    to="/builder"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
                                >
                                    Builder
                                </NavLink>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

