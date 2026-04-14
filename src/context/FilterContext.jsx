import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

export const defaultFilters = {
    search: '',
    status: 'All',
    category: 'All',
    priority: 'All',
};

export const defaultSort = {
    by: 'deadline',
    direction: 'asc',
};

export const FilterContext = createContext(null);

const resolveStateUpdate = (currentState, nextState) => {
    if (typeof nextState === 'function') {
        return resolveStateUpdate(currentState, nextState(currentState));
    }

    if (typeof nextState === 'string') {
        return {
            ...currentState,
            status: nextState,
        };
    }

    return {
        ...currentState,
        ...nextState,
    };
};

export const useFilterContext = () => {
    const context = useContext(FilterContext);

    if (!context) {
        throw new Error('useFilterContext must be used within a FilterProvider');
    }

    return context;
};

export const FilterProvider = ({ children }) => {
    const [filters, setFilters] = useState(defaultFilters);
    const [sort, setSortState] = useState(defaultSort);

    const setFilter = useCallback((nextFilters) => {
        setFilters((currentFilters) => resolveStateUpdate(currentFilters, nextFilters));
    }, []);

    const setSort = useCallback((nextSort) => {
        setSortState((currentSort) => resolveStateUpdate(currentSort, nextSort));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
        setSortState(defaultSort);
    }, []);

    const value = useMemo(() => ({
        filters,
        sort,
        setFilter,
        setSort,
        resetFilters,
    }), [filters, sort, setFilter, setSort, resetFilters]);

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
};

FilterProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
