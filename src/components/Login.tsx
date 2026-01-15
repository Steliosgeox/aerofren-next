'use client';

import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Check, Droplets, Github } from 'lucide-react';

/* ============================================
   AEROFREN Login - Theme Aware
   Refactored to support Dim (Purple), Dark (Teal), Light (Blue)
   ============================================ */

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [theme, setTheme] = useState('dim');

    return (
        <div className="login-wrapper min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans text-[var(--text-primary)]">
            <style jsx global>{`
                /* DIM THEME (Default - Purple) */
                :root, html[data-theme='dim'] .login-wrapper {
                    --bg-image: linear-gradient(to bottom right, #0f172a, #581c87, #0f172a);
                    --glass-bg: rgba(255, 255, 255, 0.03);
                    --glass-border: rgba(255, 255, 255, 0.1);
                    --text-primary: #ffffff;
                    --text-secondary: rgba(255, 255, 255, 0.7);
                    --text-muted: rgba(255, 255, 255, 0.5);
                    --input-bg: rgba(255, 255, 255, 0.1);
                    --input-border: rgba(255, 255, 255, 0.2);
                    --input-placeholder: rgba(255, 255, 255, 0.5);
                    --btn-gradient: linear-gradient(to right, #0f172a, #334155);
                    --btn-text: #ffffff;
                    --accent-color: #3b82f6; /* Blue-500 */
                    --checkbox-checked: #3b82f6;
                    --checkbox-unchecked: rgba(255, 255, 255, 0.2);
                    --divider: rgba(255, 255, 255, 0.2);
                    --social-bg: rgba(255, 255, 255, 0.05);
                    --social-bg-hover: rgba(255, 255, 255, 0.1);
                    --right-side-bg: rgba(10, 10, 10, 0.1);
                    --icon-bg: linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2));
                    --glow-gradient: linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(147, 51, 234, 0.2));
                    --bg-url: url("https://images.unsplash.com/photo-1678581231067-644dddeca6dc?w=2160&q=80");
                    --bg-filter: none;
                }

                /* FORCE HEADER TRANSPARENCY ON LOGIN */
                header.glass-header {
                    background: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                }
                header.glass-header .glass-nav-item {
                    background: rgba(var(--c-glass-rgb), 0.1) !important;
                }

                /* DARK THEME (Teal/Slate - Professional) */
                html[data-theme='dark'] .login-wrapper {
                    --bg-image: linear-gradient(to bottom right, #020617, #0f172a, #115e59);
                    --glass-bg: rgba(2, 6, 23, 0.4);
                    --glass-border: rgba(255, 255, 255, 0.05);
                    --text-primary: #f8fafc;
                    --text-secondary: #94a3b8;
                    --text-muted: #64748b;
                    --input-bg: rgba(0, 0, 0, 0.3);
                    --input-border: rgba(255, 255, 255, 0.1);
                    --input-placeholder: #475569;
                    --btn-gradient: linear-gradient(to right, #0f172a, #134e4a);
                    --btn-text: #ffffff;
                    --accent-color: #14b8a6; /* Teal-500 */
                    --checkbox-checked: #14b8a6;
                    --checkbox-unchecked: rgba(255, 255, 255, 0.1);
                    --divider: rgba(255, 255, 255, 0.1);
                    --social-bg: rgba(255, 255, 255, 0.05);
                    --social-bg-hover: rgba(255, 255, 255, 0.1);
                    --right-side-bg: rgba(0, 0, 0, 0.2);
                    --icon-bg: linear-gradient(to bottom right, rgba(20, 184, 166, 0.2), rgba(15, 118, 110, 0.2));
                    --glow-gradient: linear-gradient(to right, rgba(20, 184, 166, 0.15), rgba(15, 118, 110, 0.15));
                    --bg-url: url("https://images.unsplash.com/photo-1678581231067-644dddeca6dc?w=2160&q=80");
                    --bg-filter: hue-rotate(160deg) saturate(0.8); /* Shifts purple to teal/green */
                }

                /* LIGHT THEME (White/Blue - Corporate) */
                html[data-theme='light'] .login-wrapper {
                    --bg-image: linear-gradient(to bottom right, #eff6ff, #dbeafe, #fff);
                    --glass-bg: rgba(255, 255, 255, 0.6);
                    --glass-border: rgba(255, 255, 255, 0.5);
                    --text-primary: #1e3a8a;
                    --text-secondary: #475569;
                    --text-muted: #94a3b8;
                    --input-bg: rgba(255, 255, 255, 0.6);
                    --input-border: #bfdbfe;
                    --input-placeholder: #94a3b8;
                    --btn-gradient: linear-gradient(to right, #2563eb, #1d4ed8);
                    --btn-text: #ffffff;
                    --accent-color: #2563eb; /* Blue-600 */
                    --checkbox-checked: #2563eb;
                    --checkbox-unchecked: #cbd5e1;
                    --divider: #e2e8f0;
                    --social-bg: #ffffff;
                    --social-bg-hover: #f1f5f9;
                    --right-side-bg: rgba(255, 255, 255, 0.4);
                    --icon-bg: linear-gradient(to bottom right, rgba(37, 99, 235, 0.1), rgba(96, 165, 250, 0.1));
                    --glow-gradient: linear-gradient(to right, rgba(37, 99, 235, 0.1), rgba(96, 165, 250, 0.1));
                    --bg-url: url("https://images.unsplash.com/photo-1678581231067-644dddeca6dc?w=2160&q=80");
                    --bg-filter: hue-rotate(200deg) brightness(1.2) opacity(0.6); /* Shifts purple to blue, lighter */
                }

                .login-wrapper {
                     background: var(--bg-image);
                     transition: all 0.5s ease-in-out;
                }
                
                .login-wrapper input::placeholder {
                    color: var(--input-placeholder);
                }
            `}</style>

            {/* Background Pattern */}
            <div
                className="fixed inset-0 z-0 bg-cover transition-all duration-700"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E"), var(--bg-url)`,
                    filter: 'var(--bg-filter)'
                }}
            />

            {/* Main Login Container */}
            <div className="relative w-full max-w-5xl">
                {/* Glass Card */}
                <div
                    className="relative backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-colors duration-500"
                    style={{
                        background: 'var(--glass-bg)',
                        borderColor: 'var(--glass-border)',
                        borderWidth: '1px'
                    }}
                >
                    {/* Specular Highlight */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

                    {/* Split Layout */}
                    <div className="flex flex-col lg:flex-row min-h-[600px]">
                        {/* Left Side - Login Form */}
                        <div className="flex-1 p-8 space-y-6">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 rounded-2xl mx-auto shadow-lg flex items-center justify-center transition-all duration-500"
                                    style={{ background: 'var(--btn-gradient)' }}>
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-light tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
                            </div>

                            {/* Form */}
                            <form className="space-y-5">
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium block" style={{ color: 'var(--text-primary)' }}>Email address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300"
                                            style={{
                                                background: 'var(--input-bg)',
                                                borderColor: 'var(--input-border)',
                                                borderWidth: '1px',
                                                color: 'var(--text-primary)',
                                                '--tw-ring-color': 'var(--accent-color)'
                                            } as React.CSSProperties}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium block" style={{ color: 'var(--text-primary)' }}>Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="w-full pl-10 pr-12 py-3 rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300"
                                            style={{
                                                background: 'var(--input-bg)',
                                                borderColor: 'var(--input-border)',
                                                borderWidth: '1px',
                                                color: 'var(--text-primary)',
                                                '--tw-ring-color': 'var(--accent-color)'
                                            } as React.CSSProperties}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                                            style={{ color: 'var(--text-muted)' }}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center space-x-2 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                            <div
                                                className="w-4 h-4 rounded flex items-center justify-center border transition-colors duration-300"
                                                style={{
                                                    background: rememberMe ? 'var(--checkbox-checked)' : 'var(--checkbox-unchecked)',
                                                    borderColor: rememberMe ? 'var(--checkbox-checked)' : 'var(--input-border)'
                                                }}
                                            >
                                                {rememberMe && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="transition-colors" style={{ color: 'var(--accent-color)' }}>Forgot password?</a>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    className="w-full hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex font-medium rounded-xl py-3 px-4 shadow-lg space-x-2 items-center justify-center"
                                    style={{
                                        background: 'var(--btn-gradient)',
                                        color: 'var(--btn-text)'
                                    }}
                                >
                                    <span>Sign in</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative flex items-center">
                                <div className="flex-1 border-t" style={{ borderColor: 'var(--divider)' }} />
                                <span className="px-3 text-sm" style={{ color: 'var(--text-muted)' }}>or</span>
                                <div className="flex-1 border-t" style={{ borderColor: 'var(--divider)' }} />
                            </div>

                            {/* Social Login */}
                            <div className="space-y-3">
                                <button
                                    className="w-full py-3 px-4 rounded-xl font-medium border transition-all duration-300 flex items-center justify-center space-x-2"
                                    style={{
                                        background: 'var(--social-bg)',
                                        borderColor: 'var(--glass-border)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>

                                <button
                                    className="w-full py-3 px-4 rounded-xl font-medium border transition-all duration-300 flex items-center justify-center space-x-2"
                                    style={{
                                        background: 'var(--social-bg)',
                                        borderColor: 'var(--glass-border)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <Github className="w-5 h-5" />
                                    <span>Continue with GitHub</span>
                                </button>
                            </div>

                            {/* Sign Up Link */}
                            <div className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Don&apos;t have an account?{' '}
                                <a href="#" className="transition-colors font-medium" style={{ color: 'var(--accent-color)' }}>Sign up</a>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" style={{ opacity: 0.3 }} />

                        {/* Right Side - Welcome Content */}
                        <div className="flex-1 p-8 flex flex-col justify-center space-y-6 transition-colors duration-500" style={{ background: 'var(--right-side-bg)' }}>
                            {/* Welcome Message */}
                            <div className="space-y-4">
                                <div
                                    className="w-20 h-20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10"
                                    style={{ background: 'var(--icon-bg)' }}
                                >
                                    <Droplets className="w-10 h-10" style={{ color: 'var(--text-primary)' }} />
                                </div>
                                <h2 className="text-4xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>Join thousands of users</h2>
                                <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Experience the next generation of productivity tools designed to streamline your workflow and boost your team&apos;s performance.</p>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4">
                                {[
                                    { title: "Advanced Analytics", desc: "Get detailed insights into your performance metrics" },
                                    { title: "Team Collaboration", desc: "Work seamlessly with your team in real-time" },
                                    { title: "Enterprise Security", desc: "Bank-level security to protect your sensitive data" }
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-start space-x-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                                            <Check className="w-3 h-3 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Testimonial */}
                            <div
                                className="border rounded-2xl p-6 backdrop-blur-sm"
                                style={{
                                    background: 'var(--glass-bg)',
                                    borderColor: 'var(--glass-border)'
                                }}
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <img
                                        src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=2160&q=80"
                                        alt="User"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Sarah Chen</h4>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Product Manager at TechFlow</p>
                                    </div>
                                </div>
                                <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>&quot;This platform has completely transformed how our team collaborates. The intuitive interface and powerful features make it indispensable for our daily operations.&quot;</p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>10K+</div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Users</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>99.9%</div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>24/7</div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Support</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Glow Effect */}
                <div
                    className="absolute inset-0 -z-10 blur-3xl transition-all duration-500"
                    style={{ background: 'var(--glow-gradient)' }}
                />
            </div>
        </div>
    );
}
