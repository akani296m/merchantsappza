import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, ArrowRight, User, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Signup() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/onboarding');
        }
    }, [isAuthenticated, navigate]);

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('Please enter your full name');
            return false;
        }

        if (!formData.email.trim()) {
            setError('Please enter your email');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Sign up with Supabase Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName.trim(),
                    }
                }
            });

            if (signUpError) {
                throw signUpError;
            }

            // Check if email confirmation is required
            if (data?.user && !data.session) {
                // Email confirmation is required
                setSuccess(true);
                setError('');
            } else {
                // Account created and logged in automatically
                // Redirect to onboarding (handled by useEffect when isAuthenticated changes)
                console.log('[Signup] Account created successfully, redirecting to onboarding');
                navigate('/onboarding');
            }

        } catch (err) {
            console.error('Signup error:', err);

            // Handle specific error cases
            if (err.message?.includes('already registered')) {
                setError('This email is already registered. Try logging in instead.');
            } else if (err.message?.includes('invalid email')) {
                setError('Please enter a valid email address');
            } else {
                setError(err.message || 'Failed to create account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Start Your Store</h1>
                    <p className="text-blue-200/70">Create your merchant account to get started</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
                    {success ? (
                        // Email Confirmation Success Message
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl">✓</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                            <p className="text-blue-200 mb-2">
                                We've sent a confirmation link to:
                            </p>
                            <p className="text-white font-semibold mb-6">{formData.email}</p>
                            <p className="text-blue-200/70 text-sm mb-6">
                                Click the link in the email to verify your account, then return to login.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                            >
                                Go to Login
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        // Signup Form
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300">
                                    <AlertCircle size={18} />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            {/* Full Name Field */}
                            <div>
                                <label className="block text-blue-200 text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pl-11 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-blue-200 text-sm font-medium mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pl-11 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-blue-200 text-sm font-medium mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pl-11 pr-11 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <p className="text-blue-300/50 text-xs mt-1">At least 6 characters</p>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-blue-200 text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pl-11 pr-11 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {/* Login Link */}
                            <div className="text-center pt-4 border-t border-white/10">
                                <p className="text-blue-200/70 text-sm">
                                    Already have an account?{' '}
                                    <Link
                                        to="/login"
                                        className="text-blue-300 hover:text-white font-semibold transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-blue-300/50 text-sm mt-6">
                    By creating an account, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}
