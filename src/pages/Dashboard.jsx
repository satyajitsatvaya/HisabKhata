import { useState, useEffect } from 'react';
import { getExpenses, getCategorySummary, getMonthlySummary } from '../api/expenseService';
import { getOverallBudgetUsage } from '../api/budgetService';
import { IndianRupee, TrendingUp, Wallet, Plus, Utensils, ShoppingBag, Car, Zap, Home, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { getDateLabel, getCategoryIcon } from '../utils/uiHelpers';

const Dashboard = () => {
    const { showAlert } = useAlert();
    const { user } = useAuth();
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [lastMonthTotal, setLastMonthTotal] = useState(0); // For Delta
    const [categorySummary, setCategorySummary] = useState({});
    const [budgetStatus, setBudgetStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const [dailySafeSpend, setDailySafeSpend] = useState(0);
    const [projectedSpend, setProjectedSpend] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1;

                // Calculate previous month
                const lastMonthDate = new Date(year, month - 2, 1);
                const lastYear = lastMonthDate.getFullYear();
                const lastMonth = lastMonthDate.getMonth() + 1;

                const [expensesData, monthlyData, lastMonthData, categoryData, budgetData] = await Promise.all([
                    getExpenses({}, 0, 10),
                    getMonthlySummary(year, month),
                    getMonthlySummary(lastYear, lastMonth), // Fetch last month
                    getCategorySummary(),
                    getOverallBudgetUsage(year, month)
                ]);

                setRecentExpenses(expensesData.content);
                setMonthlyTotal(monthlyData?.Total ?? 0);
                setLastMonthTotal(lastMonthData?.Total ?? 0);
                setCategorySummary(categoryData);
                setBudgetStatus(budgetData);

                // --- Smart Calculations ---

                // 1. Safe Daily Spend
                const daysInMonth = new Date(year, month, 0).getDate();
                const currentDay = today.getDate();
                const daysLeft = daysInMonth - currentDay;

                if (budgetData?.budgetAmount && daysLeft > 0) {
                    const remaining = budgetData.budgetAmount - monthlyData.Total;
                    setDailySafeSpend(remaining > 0 ? remaining / daysLeft : 0);
                }

                // 2. End-of-Month Projection
                if (currentDay > 1) { // Avoid division by zero or skewed data on day 1
                    const dailyAvg = monthlyData.Total / currentDay;
                    setProjectedSpend(dailyAvg * daysInMonth);
                } else {
                    setProjectedSpend(monthlyData.Total * daysInMonth); // Rough estimate for day 1
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                if (showAlert) showAlert("Failed to load dashboard data", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [showAlert]);

    // Helper to group transactions
    const groupedExpenses = recentExpenses.reduce((groups, expense) => {
        const date = new Date(expense.expenseDate).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(expense);
        return groups;
    }, {});

    if (loading) return <div className="flex justify-center items-center h-full text-slate-500">Loading Dashboard...</div>;

    const isOverBudget = budgetStatus?.budgetAmount && monthlyTotal > budgetStatus.budgetAmount;
    const isProjectedOver = budgetStatus?.budgetAmount && projectedSpend > budgetStatus.budgetAmount;

    // Calculate Delta
    const deltaPercent = lastMonthTotal > 0 ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    const isSpendingMore = deltaPercent > 0;

    return (
        <div className="space-y-6 relative h-full">
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Hi, {user?.email?.split('@')[0] || 'there'} 👋</h1>
                    <p className="text-slate-500 text-sm">Here's your smart financial overview</p>
                </div>
                <Link to="/expenses" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg shadow-blue-200 transition-all flex items-center justify-center">
                    <Plus size={24} />
                </Link>
            </div>

            {/* Smart Insights / Alerts Section */}
            {(isOverBudget || isProjectedOver) && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${isOverBudget ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                    <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-sm">
                            {isOverBudget ? "Budget Exceeded" : "Projection Warning"}
                        </h4>
                        <p className="text-xs mt-1 opacity-90">
                            {isOverBudget
                                ? `You've spent ₹${(monthlyTotal - budgetStatus.budgetAmount).toLocaleString()} over your limit.`
                                : `At this rate, you'll reach ₹${projectedSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })} by month end.`}
                        </p>
                    </div>
                </div>
            )}

            {/* Green Alert for Good Status */}
            {!isOverBudget && !isProjectedOver && budgetStatus?.budgetAmount && (
                <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-100 text-emerald-700 flex items-start gap-3">
                    <CheckCircle size={20} className="mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-sm">On Track!</h4>
                        <p className="text-xs mt-1 opacity-90">
                            You are spending wisely. Keep it up!
                        </p>
                    </div>
                </div>
            )}


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. Monthly Budget Card (Spans 2 cols on LG) */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Monthly Budget</p>
                            <div className="flex items-baseline gap-3 mt-1">
                                <h3 className="text-3xl font-bold text-slate-800">
                                    ₹{monthlyTotal.toLocaleString()}
                                </h3>
                                {/* MoM Delta Badge */}
                                {lastMonthTotal > 0 && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSpendingMore ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {isSpendingMore ? '↑' : '↓'} {Math.abs(deltaPercent).toFixed(1)}% vs last month
                                    </span>
                                )}
                            </div>
                            <span className="text-base font-normal text-slate-400">
                                / {budgetStatus?.budgetAmount ? `₹${budgetStatus.budgetAmount.toLocaleString()}` : 'No Limit'}
                            </span>
                        </div>
                        <div className={`p-3 rounded-xl ${budgetStatus?.overSpent ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Wallet size={24} />
                        </div>
                    </div>
                    {budgetStatus?.budgetAmount > 0 ? (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs font-medium mb-1">
                                <span className={budgetStatus.overSpent ? "text-red-500" : "text-blue-600"}>
                                    {budgetStatus.usagePercentage}% Used
                                </span>
                                <span className="text-slate-400">
                                    ₹{budgetStatus.remainingAmount.toLocaleString()} Left
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${budgetStatus.overSpent ? 'bg-red-500' : 'bg-blue-600'}`}
                                    style={{ width: `${Math.min(budgetStatus.usagePercentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 text-xs text-slate-400">Set a budget to track progress</div>
                    )}
                </div>

                {/* 2. Safe Daily Spend (New Feature) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Safe Daily Spend</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                            ₹{dailySafeSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h3>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                            For the rest of the month
                        </p>
                    </div>
                    <div className="self-end p-2 bg-emerald-50 rounded-lg text-emerald-500">
                        <Calculator size={20} />
                    </div>
                </div>

                {/* 3. Top Spending Category */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Top Spending</p>
                        {Object.keys(categorySummary).length > 0 ? (
                            <>
                                <h3 className="text-xl font-bold text-slate-800 mt-2 truncate">
                                    {Object.entries(categorySummary).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">High impact category</p>
                            </>
                        ) : (
                            <h3 className="text-xl font-bold text-slate-800 mt-2">None</h3>
                        )}
                    </div>
                    <div className="self-end p-2 bg-indigo-50 rounded-lg text-indigo-500">
                        <TrendingUp size={20} />
                    </div>
                </div>
            </div>

            {/* Smart Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>

                    <div className="flex items-center gap-2">
                        {/* Quick filter links */}
                        <Link to="/expenses?category=Food" className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full font-medium hover:bg-orange-100 transition-colors">
                            Food
                        </Link>
                        <Link to="/expenses?category=Transport" className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium hover:bg-blue-100 transition-colors">
                            Transport
                        </Link>
                        <Link to="/expenses" className="text-sm text-blue-600 font-semibold hover:text-blue-700 ml-2">View All</Link>
                    </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {recentExpenses.length === 0 ? (
                        <p className="p-8 text-slate-400 text-center italic">No transactions yet. Start spending! (Wisely)</p>
                    ) : (
                        Object.entries(groupedExpenses).map(([date, expenses]) => (
                            <div key={date}>
                                <div className="bg-slate-50 px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wide sticky top-0">
                                    {getDateLabel(date)}
                                </div>
                                <div>
                                    {expenses.map((expense) => (
                                        <div key={expense.id} className="p-6 flex items-center justify-between hover:bg-white transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-100 text-slate-600 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    {getCategoryIcon(expense.category)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{expense.title}</h4>
                                                    <p className="text-xs text-slate-500">{expense.category}</p>
                                                </div>
                                            </div>
                                            <div className="font-bold text-slate-800">
                                                -₹{expense.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
