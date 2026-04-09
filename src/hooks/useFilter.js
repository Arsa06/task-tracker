import { useMemo } from 'react';
import { isSameDay, parseISO } from 'date-fns';

export function useFilter(items, options) {
    const { 
        search = '',
        category = 'All', 
        status = 'All', 
        priority = 'All',
        date = null, // For calendar filtering
        sortBy = 'date', 
        sortDirection = 'asc' 
    } = options;

    const processedItems = useMemo(() => {
        if (!items) return [];
        let result = items;

        // Search Filter
        if (search) {
            const query = search.toLowerCase();
            result = result.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.description?.toLowerCase().includes(query) ||
                item.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Category Filter
        if (category !== 'All') {
            result = result.filter(item => item.category === category);
        }

        // Status Filter
        if (status !== 'All') {
            const isCompleted = status === 'Completed';
            result = result.filter(item => item.completed === isCompleted);
        }

        // Priority Filter
        if (priority !== 'All') {
            result = result.filter(item => item.priority === priority);
        }

        // Date Filter (Specific Day)
        if (date) {
            result = result.filter(item => {
                if (!item.deadline) return false;
                return isSameDay(parseISO(item.deadline), date);
            });
        }

        // Sorting
        if (sortBy) {
            result = [...result].sort((a, b) => {
                let aVal, bVal;

                if (sortBy === 'date' || sortBy === 'deadline') {
                    aVal = a.deadline ? new Date(a.deadline).getTime() : Infinity;
                    bVal = b.deadline ? new Date(b.deadline).getTime() : Infinity;
                } else if (sortBy === 'priority') {
                    const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    aVal = weight[a.priority] || 0;
                    bVal = weight[b.priority] || 0;
                    // Sort priority descending by default (High first)
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                } else {
                    aVal = a[sortBy];
                    bVal = b[sortBy];
                }

                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [items, search, category, status, priority, date, sortBy, sortDirection]);

    return processedItems;
}
