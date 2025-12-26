import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, currentUser, handleLogout }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navLinkClass = ({ isActive }) =>
        `text-sm font-medium transition-colors cursor-pointer ${isActive
            ? 'text-blue-600 bg-blue-50 px-3 py-2 rounded-lg'
            : 'text-gray-600 hover:text-blue-600 px-3 py-2'
        }`;

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link
                        to={isAuthenticated ? '/builder' : '/'}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105">
                            <span className="text-white text-xl">📄</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-all">
                                ResumeBuilder
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Pro Edition</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <NavLink
                            to="/"
                            className={navLinkClass}
                            end
                        >
                            Home
                        </NavLink>

                        {!isAuthenticated && (
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2"
                            >
                                Features
                            </button>
                        )}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-6">
                                <NavLink
                                    to="/builder"
                                    className={navLinkClass}
                                >
                                    My Resumes
                                </NavLink>

                                <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-sm border border-white shadow-sm">
                                            👤
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {currentUser?.name || 'User'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <span className="text-xl">✕</span>
                        ) : (
                            <span className="text-xl">☰</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute w-full bg-white border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2">
                    <div className="px-4 py-6 space-y-4">
                        {!isAuthenticated ? (
                            <>
                                <NavLink
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
                                    end
                                >
                                    Home
                                </NavLink>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <NavLink
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl border border-gray-200"
                                >
                                    Log In
                                </NavLink>
                                <NavLink
                                    to="/signup"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
                                >
                                    Get Started Free
                                </NavLink>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        👤
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{currentUser?.name}</p>
                                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                                    </div>
                                </div>
                                <NavLink
                                    to="/builder"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block w-full text-left px-4 py-3 rounded-xl font-medium ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    My Resumes
                                </NavLink>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                                >
                                    Sign Out
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
