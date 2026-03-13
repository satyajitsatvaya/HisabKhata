import { useState, useEffect } from 'react';
import { getCategoryMonthlySummary, getMonthlySummary, getDailySummary, getExpenses } from '../api/expenseService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
        <ArchiveBoxXMarkIcon className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm font-medium">{message}</p>
    </div>
);

const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 ring-1 ring-slate-400/5">
                <p className="text-sm font-semibold text-slate-800 mb-1">{label}</p>
                <p className="text-sm text-blue-600 font-medium">
                    {formatter ? formatter(payload[0].value) : payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const Analytics = () => {
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12

    const [recurringCandidates, setRecurringCandidates] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Category Summary
                const catSummary = await getCategoryMonthlySummary(selectedYear, selectedMonth);
                const rawCategories = catSummary.Total || {};

                let catChartData = Object.entries(rawCategories)
                    .map(([name, value]) => ({
                        name,
                        value: parseFloat(value)
                    }))
                    .filter(item => item.value > 0);

                const total = catChartData.reduce((acc, item) => acc + item.value, 0);
                catChartData = catChartData.map(item => ({
                    ...item,
                    percent: total > 0 ? item.value / total : 0
                }));

                setCategoryData(catChartData);

                // 2. Fetch Monthly Trends
                const today = new Date();
                const currentMonthIdx = today.getMonth();
                const currentYear = today.getFullYear();

                const months = [];
                for (let i = 5; i >= 0; i--) {
                    let m = currentMonthIdx - i;
                    let y = currentYear;
                    if (m < 0) {
                        m += 12;
                        y -= 1;
                    }
                    months.push({ year: y, month: m + 1 });
                }

                const stats = await Promise.all(months.map(async ({ year, month }) => {
                    const data = await getMonthlySummary(year, month);
                    return {
                        name: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
                        total: data.Total || 0
                    };
                }));
                setMonthlyData(stats);

                // 3. Fetch Daily Data
                const dailyRes = await getDailySummary(selectedYear, selectedMonth);
                const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                const dailyChartData = [];
                for (let d = 1; d <= daysInMonth; d++) {
                    dailyChartData.push({
                        day: d,
                        amount: dailyRes[d] || 0
                    });
                }
                setDailyData(dailyChartData);

                // 4. Recurring Analysis (Simple Implementation)
                // Fetch recent expenses for this month to check patterns
                const expenseRes = await getExpenses({ from: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01` }, 0, 100);
                const expenses = expenseRes.content || [];

                // Group by Title + Amount
                const groups = {};
                expenses.forEach(e => {
                    const key = `${e.title.trim().toLowerCase()}-${e.amount}`;
                    if (!groups[key]) groups[key] = { count: 0, expense: e };
                    groups[key].count++;
                });

                // Filter potentially recurring (appearing more than once is a weak signal in 1 month, 
                // but if we look at "Expenses with same amount across months" it's better.
                // For now, let's just show "High frequency" items or if we fetched last month too.
                // Simpler specific logic: Items with keywords "Netflix", "Spotify", "Rent", "Bill", "SIP" OR Count > 1
                const potential = Object.values(groups).filter(g => {
                    const title = g.expense.title.toLowerCase();
                    const keywords = ['netflix', 'spotify', 'prime', 'youtube', 'bill', 'rent', 'sip', 'wifi', 'internet', 'gym'];
                    const isKeyword = keywords.some(k => title.includes(k));
                    return g.count > 1 || isKeyword; // Show if frequent OR looks like a sub
                }).map(g => g.expense);

                setRecurringCandidates(potential);

            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear, selectedMonth]);

    const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));
    const handleMonthChange = (e) => setSelectedMonth(parseInt(e.target.value));

    // Generate year options (e.g., current year - 5 to current year)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (loading && !categoryData.length) return <div className="text-center py-12 text-slate-500">Loading analytics...</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>

                {/* Month/Year Filters */}
                <div className="flex gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="form-select bg-transparent border-none text-slate-700 font-semibold focus:ring-0 cursor-pointer"
                    >
                        {monthNames.map((m, idx) => (
                            <option key={idx} value={idx + 1}>{m}</option>
                        ))}
                    </select>
                    <div className="w-px bg-slate-200 mx-2"></div>
                    <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="form-select bg-transparent border-none text-slate-700 font-semibold focus:ring-0 cursor-pointer"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Masonry-style Layout: 2 Columns */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">

                {/* LEFT COLUMN */}
                <div className="flex-1 space-y-6 w-full min-w-0">

                    {/* 1. Category Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Expenses by Category</h3>
                        <div className="h-[24rem] flex items-center justify-center">
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip formatter={(val) => `₹${val.toLocaleString()}`} />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value, entry) => {
                                                const percentage = entry.payload.percent;
                                                const percentText = percentage > 0 && percentage < 0.01
                                                    ? '< 1%'
                                                    : `${(percentage * 100).toFixed(0)}%`;
                                                return <span className="text-slate-600 font-medium ml-1">{value} <span className="text-slate-400 text-xs">({percentText})</span></span>;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No expenses found for this month" />
                            )}
                        </div>
                    </div>

                    {/* 2. Monthly Trends */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Trends (Last 6 Months)</h3>
                        <div className="h-72">
                            {monthlyData.length > 0 && monthlyData.some(m => m.total > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                                        />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip formatter={(val) => `₹${val.toLocaleString()}`} />} />
                                        <Bar dataKey="total" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No history available yet" />
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex-1 space-y-6 w-full min-w-0">

                    {/* 3. Weekend vs Weekday */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Weekend vs Weekday</h3>
                        {dailyData.length > 0 ? (
                            (() => {
                                let weekendSum = 0;
                                let weekdaySum = 0;
                                dailyData.forEach(d => {
                                    const date = new Date(selectedYear, selectedMonth - 1, d.day);
                                    const dayOfWeek = date.getDay();
                                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                                        weekendSum += d.amount;
                                    } else {
                                        weekdaySum += d.amount;
                                    }
                                });

                                const splitData = [
                                    { name: 'Weekday', value: weekdaySum, color: '#3B82F6' },
                                    { name: 'Weekend', value: weekendSum, color: '#F59E0B' }
                                ].filter(d => d.value > 0);

                                if (splitData.length === 0) return <EmptyState message="No spending data" />;

                                return (
                                    <div>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={splitData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {splitData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip formatter={(val) => `₹${val.toLocaleString()}`} />} />
                                                    <Legend verticalAlign="bottom" iconType="circle" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <p className="mt-3 text-center text-sm text-slate-500">
                                            <strong className="text-slate-700">{((weekendSum / (weekendSum + weekdaySum || 1)) * 100).toFixed(0)}%</strong> of spending happens on weekends.
                                        </p>
                                    </div>
                                );
                            })()
                        ) : (
                            <EmptyState message="No spending data" />
                        )}
                    </div>

                    {/* 4. Daily Expenses Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            Daily Expenses ({monthNames[selectedMonth - 1]})
                        </h3>
                        <div className="h-64">
                            {dailyData.length > 0 && dailyData.some(d => d.amount > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                                        />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip formatter={(val) => `₹${val.toLocaleString()}`} />} />
                                        <Bar dataKey="amount" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No daily activity recorded" />
                            )}
                        </div>
                    </div>

                    {/* 5. Potential Subscriptions (Moved to bottom of Right Column) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Recurring Expenses
                            <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">AI Detect</span>
                        </h3>
                        {recurringCandidates.length > 0 ? (
                            <div className="space-y-3">
                                {recurringCandidates.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                <span className="text-xs font-bold">↻</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-700 text-sm">{item.title}</p>
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-800">₹{item.amount}</span>
                                    </div>
                                ))}
                                <p className="text-xs text-center text-slate-400 mt-2">
                                    Detected based on frequency & common names.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No recurring bills detected this month.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
