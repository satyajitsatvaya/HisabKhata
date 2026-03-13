import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    IndianRupee, TrendingUp, PieChart, Shield, Wallet,
    BarChart2, X, ArrowRight, Lock
} from 'lucide-react';

const Home = () => {
    const { user } = useAuth();
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // If already logged in, redirect to app
    if (user) return <Navigate to="/app" replace />;

    const features = [
        { icon: IndianRupee, title: 'Smart Expense Tracking', desc: 'Log and categorise every rupee you spend — Food, Transport, Housing and more.' },
        { icon: PieChart, title: 'Visual Analytics', desc: 'Beautiful charts showing where your money goes, month by month.' },
        { icon: Wallet, title: 'Budget Planning', desc: 'Set monthly budgets per category and track your progress in real time.' },
        { icon: TrendingUp, title: 'Spending Insights', desc: 'Daily spend trends, weekend vs weekday analysis, and recurring expense detection.' },
        { icon: Shield, title: 'Secure & Private', desc: 'JWT-based authentication. Your financial data stays yours.' },
        { icon: BarChart2, title: 'Monthly Reports', desc: 'Compare this month to last, spot patterns, and stay on top of your money.' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

            {/* ── Navbar ── */}
            <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800/60 backdrop-blur-sm sticky top-0 z-40 bg-slate-950/80">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    HisabKhata
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-all"
                    >
                        Register
                    </button>
                    <Link
                        to="/login"
                        className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/40"
                    >
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative flex flex-col items-center text-center pt-28 pb-24 px-6">
                {/* Glowing blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

                <span className="relative mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Personal Finance — Simplified
                </span>

                <h2 className="relative text-5xl sm:text-6xl font-extrabold leading-tight max-w-3xl mb-6">
                    Take control of{' '}
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        every rupee
                    </span>
                </h2>

                <p className="relative text-lg text-slate-400 max-w-xl mb-10">
                    HisabKhata is your personal expense tracker — built to help you understand your spending, set budgets, and hit your financial goals.
                </p>

                <div className="relative flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-xl shadow-emerald-900/50 transition-all hover:scale-105"
                    >
                        Get Started <ArrowRight size={18} />
                    </Link>
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-all"
                    >
                        <Lock size={16} /> Request Access
                    </button>
                </div>
            </section>

            {/* ── Features Grid ── */}
            <section className="px-6 pb-24 max-w-5xl mx-auto">
                <h3 className="text-center text-2xl font-bold text-white mb-2">Everything you need</h3>
                <p className="text-center text-slate-500 mb-12">One app, all your finances</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                                <Icon size={22} className="text-emerald-400" />
                            </div>
                            <h4 className="font-bold text-white mb-1">{title}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="px-6 pb-24">
                <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 p-10 text-center">
                    <h3 className="text-3xl font-bold mb-3">Ready to start tracking?</h3>
                    <p className="text-slate-400 mb-7">Sign in to your account and take charge of your finances today.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all hover:scale-105"
                    >
                        Sign In Now <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-slate-800 px-8 py-6 text-center text-slate-600 text-sm">
                © 2026 HisabKhata — Built with ❤️ by Satyajit
            </footer>

            {/* ── Register Blocked Modal ── */}
            {showRegisterModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowRegisterModal(false)}
                >
                    <div
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
                            <Lock size={28} className="text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Registration Restricted</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            New registrations are currently <span className="text-amber-400 font-semibold">invite-only</span>. Please contact the admin to request access.
                        </p>
                        <a
                            href="mailto:satyajitsatvaya6@gmail.com"
                            className="inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all mb-3"
                        >
                            Contact Admin
                        </a>
                        <button
                            onClick={() => setShowRegisterModal(false)}
                            className="w-full px-5 py-2.5 text-slate-400 hover:text-white text-sm transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
