import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PiggyBank, PieChart, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ darkMode, toggleTheme }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const links = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/expenses', label: 'Expenses', icon: Receipt },
        { to: '/budgets', label: 'Budgets', icon: PiggyBank },
        { to: '/analytics', label: 'Analytics', icon: PieChart },
    ];

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800">
            <div className="p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    HisabKhata
                </h1>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-yellow-400 transition-colors"
                    title="Toggle Theme"
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'} />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
