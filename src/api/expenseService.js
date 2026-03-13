import api from './axios';

export const getExpenses = async (filters = {}, page = 0, size = 10) => {
    const params = { ...filters, page, size };
    const response = await api.get('/expenses', { params });
    return response.data;
};

export const addExpense = async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
};

export const updateExpense = async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};

export const getCategorySummary = async () => {
    const response = await api.get('/analytics/category-summary');
    return response.data
}

export const getCategoryMonthlySummary = async (year, month) => {
    const response = await api.get('/analytics/category-monthly', { params: { year, month } });
    return response.data;
}

export const getMonthlySummary = async (year, month) => {
    const response = await api.get('/analytics/monthly', { params: { year, month } });
    return response.data;
}

export const getDailySummary = async (year, month) => {
    const response = await api.get('/analytics/daily', { params: { year, month } });
    return response.data;
}
