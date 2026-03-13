import { useState, useEffect } from 'react';
import { getBudgetsForMonth, createOrUpdateBudget, getCategoryUsage } from '../api/budgetService';
import { Loader2, Plus, Edit2 } from 'lucide-react';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);

    // Form State
    const [category, setCategory] = useState('Overall');
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get budgets for this month
            const budgetList = await getBudgetsForMonth(year, month);

            // 2. For each budget, fetch usage
            // Note: Ideally backend should provide a composite response, but we'll do N+1 requests for now as per controller design
            const budgetsWithUsage = await Promise.all(budgetList.map(async (b) => {
                try {
                    const usage = await getCategoryUsage(b.category, year, month);
                    return { ...b, usage }; // usage: { totalLimit, totalSpent, percentage, remaining }
                } catch (e) {
                    return { ...b, usage: { spentAmount: 0, usagePercentage: 0 } };
                }
            }));

            setBudgets(budgetsWithUsage);
        } catch (error) {
            console.error("Failed to fetch budgets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [year, month]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createOrUpdateBudget({
                category: category === 'Overall' ? null : category,
                amount: parseFloat(amount),
                year,
                month
            });
            setModalOpen(false);
            fetchData();
            setAmount('');
        } catch (error) {
            console.error("Failed to save budget", error);
        } finally {
            setSaving(false);
        }
    };

    const openModal = (budget = null) => {
        if (budget) {
            setCategory(budget.category);
            setAmount(budget.budgetAmount);
            setSelectedBudget(budget);
        } else {
            setCategory('Overall');
            setAmount('');
            setSelectedBudget(null);
        }
        setModalOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Budgets</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={20} /> Set Budget
                </button>
            </div>

            {/* Month/Year Selector */}
            <div className="flex gap-4 mb-6">
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="px-4 py-2 border border-slate-200 rounded-xl w-32"
                />
                <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading budgets...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {budgets.map((budget) => (
                        <div key={budget.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
                            <button
                                onClick={() => openModal(budget)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-emerald-500"
                            >
                                <Edit2 size={18} />
                            </button>

                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{budget.category}</h3>
                                    <p className="text-sm text-slate-500">
                                        ₹{budget.usage?.spentAmount || 0} spent of ₹{budget.budgetAmount}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-bold ${(budget.usage?.usagePercentage || 0) > 100 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {(budget.usage?.usagePercentage || 0).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${(budget.usage?.usagePercentage || 0) > 100 ? 'bg-red-500' :
                                        (budget.usage?.usagePercentage || 0) > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: `${Math.min(budget.usage?.usagePercentage || 0, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}

                    {budgets.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-500">No budgets set for this month.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">{selectedBudget ? 'Edit Budget' : 'Set New Budget'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    disabled={!!selectedBudget} // Disable changing category when editing
                                >
                                    {['Overall', 'Food', 'Transport', 'Entertainment', 'Housing', 'Utilities', 'Health', 'Other'].map(cat => (
                                        <option key={cat} value={cat}>{cat === 'Overall' ? '🌐 Overall (All Categories)' : cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Limit Amount</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 flex justify-center">
                                    {saving ? <Loader2 className="animate-spin" /> : 'Save Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
