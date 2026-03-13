import api from './axios';

export const createOrUpdateBudget = async (budgetData) => {
    const response = await api.post('/budgets', budgetData);
    return response.data;
};

export const getBudgetsForMonth = async (year, month) => {
    const response = await api.get('/budgets/month', { params: { year, month } });
    return response.data;
};

export const getBudgetUsage = async (year, month) => {
    // This endpoint returns usage for ONE category if specified, or all? 
    // Controller says: getMonthlyBudgetUsage(category, year, month)
    // If category is null, it might error or return something else.
    // Let's assume we want to iterate over categories or use a different approach if backend supports it.
    // Looking at backend code: getMonthlyBudgetUsage inside service likely returns one DTO.
    // So for the list, we might need to rely on `getBudgetsForMonth` and separate expense calls, OR we can fetch usage for each category.
    // However, `BudgetResponse` usually contains the limit. We can calculate usage from expenses on frontend or fetch usage individually.
    // Let's rely on basic budget list for now.
    const response = await api.get('/budgets/month', { params: { year, month } });
    return response.data;
};

// We might need to fetch usage individually or if `BudgetResponse` includes usage?
// Backend DTO `BudgetResponse`: likely just id, amount, category, month, year.
// Backend `BudgetUsageResponse`: totalLimit, totalSpent, percentage.
// To show a list of budgets with progress bars, we'd need usage for each.
// We can use `getBudgetUsage` for each category.

export const getCategoryUsage = async (category, year, month) => {
    const response = await api.get('/budgets/usage', { params: { category, year, month } });
    return response.data;
}

export const getOverallBudgetUsage = async (year, month) => {
    const response = await api.get('/budgets/usage', { params: { category: 'OVERALL', year, month } });
    return response.data;
};
