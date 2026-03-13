import { IndianRupee, Utensils, ShoppingBag, Car, Zap, Home } from 'lucide-react';

export const getDateLabel = (dateStr) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return dateStr;
};

export const getCategoryIcon = (category) => {
    if (!category) return <IndianRupee size={20} />;
    const lower = category.toLowerCase();
    if (lower.includes('food') || lower.includes('drink')) return <Utensils size={20} />;
    if (lower.includes('transport') || lower.includes('fuel')) return <Car size={20} />;
    if (lower.includes('shop')) return <ShoppingBag size={20} />;
    if (lower.includes('bill') || lower.includes('electric')) return <Zap size={20} />;
    if (lower.includes('home') || lower.includes('rent')) return <Home size={20} />;
    return <IndianRupee size={20} />;
};
