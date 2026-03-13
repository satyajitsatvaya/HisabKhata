import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { addExpense } from '../api/expenseService';
import { useAlert } from '../context/AlertContext';

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        expenseDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    const { showAlert } = useAlert();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addExpense(formData);
            onExpenseAdded();
            onClose();

            // Smart Feedback
            if (Number(formData.amount) > 5000) {
                showAlert(`Big spend of ₹${formData.amount} recorded! Check your budget.`, "warning");
            } else {
                showAlert("Expense added successfully!", "success");
            }

            setFormData({
                title: '',
                amount: '',
                category: 'Food',
                expenseDate: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Failed to add expense", error);
            showAlert("Failed to add expense", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Add New Expense</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {['Food', 'Transport', 'Entertainment', 'Housing', 'Utilities', 'Health', 'Other'].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.expenseDate}
                            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Add Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
