import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getExpenses, deleteExpense } from '../api/expenseService';
import { Plus, Filter, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import { useAlert } from '../context/AlertContext';
import { getDateLabel, getCategoryIcon } from '../utils/uiHelpers';

const Expenses = () => {
    const [searchParams] = useSearchParams();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (category) filters.category = category;
            if (fromDate) filters.from = fromDate;
            if (toDate) filters.to = toDate;

            const data = await getExpenses(filters, page, 10);
            setExpenses(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setLoading(false);
        }
    };

    // When filters change, reset to page 0
    useEffect(() => {
        setPage(0);
    }, [category, fromDate, toDate]);

    // Fetch whenever page changes (which also fires after filter-driven page reset)
    useEffect(() => {
        fetchExpenses();
    }, [page, category, fromDate, toDate]);

    const { showAlert } = useAlert();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await deleteExpense(id);
                showAlert("Expense deleted successfully", "success");
                fetchExpenses();
            } catch (error) {
                console.error("Failed to delete expense", error);
                showAlert("Failed to delete expense", "error");
            }
        }
    };

    const handleExport = async () => {
        try {
            // Fetch a large batch for export (e.g. 1000) or we could implement a specific export API
            // For UI-only, we'll fetch the first 1000 items with current filters
            const filters = {};
            if (category) filters.category = category;
            if (fromDate) filters.from = fromDate;
            if (toDate) filters.to = toDate;

            const data = await getExpenses(filters, 0, 1000);
            const expensesToExport = data.content;

            if (!expensesToExport || expensesToExport.length === 0) {
                showAlert("No expenses to export", "info");
                return;
            }

            // Convert to CSV
            const headers = ["Title", "Category", "Amount", "Date"];
            const csvRows = [headers.join(',')];

            expensesToExport.forEach(exp => {
                const row = [
                    `"${exp.title.replace(/"/g, '""')}"`, // Escape quotes
                    exp.category,
                    exp.amount,
                    exp.expenseDate
                ];
                csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showAlert("Export started successfully", "success");

        } catch (error) {
            console.error("Export failed", error);
            showAlert("Failed to export data", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Expenses</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Export
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-sm shadow-emerald-200"
                    >
                        <Plus size={20} /> Add Expense
                    </button>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onExpenseAdded={fetchExpenses}
            />

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-700"
                    >
                        <option value="">All Categories</option>
                        {['Food', 'Transport', 'Entertainment', 'Housing', 'Utilities', 'Health', 'Other'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-700"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-700"
                    />
                </div>

                <button
                    onClick={() => { setCategory(''); setFromDate(''); setToDate(''); }}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium"
                >
                    Clear
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Title</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Category</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Amount</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : expenses.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No expenses found</td></tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-800">{expense.title}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                                    {getCategoryIcon(expense.category)}
                                                </div>
                                                <span className="text-slate-700 font-medium">{expense.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {getDateLabel(new Date(expense.expenseDate).toLocaleDateString())}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-slate-900">
                                            -₹{expense.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
