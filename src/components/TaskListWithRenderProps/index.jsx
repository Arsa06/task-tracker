import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FilterContext, defaultFilters, defaultSort } from '../../context/FilterContext';

const priorityWeight = {
    High: 3,
    Medium: 2,
    Low: 1,
};

const normalizeFilterUpdate = (currentFilter, nextFilter) => {
    if (typeof nextFilter === 'function') {
        return normalizeFilterUpdate(currentFilter, nextFilter(currentFilter));
    }

    if (typeof nextFilter === 'string') {
        return {
            ...currentFilter,
            status: nextFilter,
        };
    }

    return {
        ...currentFilter,
        ...nextFilter,
    };
};

const normalizeSortUpdate = (currentSort, nextSort) => {
    if (typeof nextSort === 'function') {
        return normalizeSortUpdate(currentSort, nextSort(currentSort));
    }

    if (typeof nextSort === 'string') {
        return {
            ...currentSort,
            by: nextSort,
        };
    }

    return {
        ...currentSort,
        ...nextSort,
    };
};

const sortTasks = (tasks, sort) => {
    const { by, direction } = sort;
    const safeDirection = direction === 'desc' ? 'desc' : 'asc';

    return [...tasks].sort((a, b) => {
        let leftValue;
        let rightValue;

        if (by === 'priority') {
            leftValue = priorityWeight[a.priority] || 0;
            rightValue = priorityWeight[b.priority] || 0;
        } else if (by === 'title') {
            leftValue = a.title?.toLowerCase() || '';
            rightValue = b.title?.toLowerCase() || '';
        } else if (by === 'createdAt') {
            leftValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            rightValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        } else {
            leftValue = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            rightValue = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        }

        if (leftValue < rightValue) {
            return safeDirection === 'asc' ? -1 : 1;
        }

        if (leftValue > rightValue) {
            return safeDirection === 'asc' ? 1 : -1;
        }

        return 0;
    });
};

const TaskListWithRenderProps = ({
    tasks,
    render,
    children,
    initialFilter,
    initialSort,
}) => {
    const filterContext = useContext(FilterContext);
    const [localFilter, setLocalFilterState] = useState({
        ...defaultFilters,
        ...initialFilter,
    });
    const [localSort, setLocalSortState] = useState({
        ...defaultSort,
        ...initialSort,
    });
    const filter = filterContext?.filters || localFilter;
    const sort = filterContext?.sort || localSort;

    const resetFilters = useCallback(() => {
        if (filterContext?.resetFilters) {
            filterContext.resetFilters();
            return;
        }

        setLocalFilterState({
            ...defaultFilters,
            ...initialFilter,
        });
        setLocalSortState({
            ...defaultSort,
            ...initialSort,
        });
    }, [filterContext, initialFilter, initialSort]);

    const setFilter = useCallback((nextFilter) => {
        if (filterContext?.setFilter) {
            filterContext.setFilter(nextFilter);
            return;
        }

        setLocalFilterState((currentFilter) => normalizeFilterUpdate(currentFilter, nextFilter));
    }, [filterContext]);

    const setSort = useCallback((nextSort) => {
        if (filterContext?.setSort) {
            filterContext.setSort(nextSort);
            return;
        }

        setLocalSortState((currentSort) => normalizeSortUpdate(currentSort, nextSort));
    }, [filterContext]);

    const filteredTasks = useMemo(() => {
        const query = filter.search.trim().toLowerCase();

        const processedTasks = tasks.filter((task) => {
            const matchesSearch = !query
                || task.title?.toLowerCase().includes(query)
                || task.description?.toLowerCase().includes(query)
                || task.tags?.some((tag) => tag.toLowerCase().includes(query));

            const matchesStatus = filter.status === 'All'
                || (filter.status === 'Completed' && task.completed)
                || (filter.status === 'Active' && !task.completed);

            const matchesCategory = filter.category === 'All' || task.category === filter.category;
            const matchesPriority = filter.priority === 'All' || task.priority === filter.priority;

            return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
        });

        return sortTasks(processedTasks, sort);
    }, [tasks, filter, sort]);

    const renderFn = children || render;

    if (!renderFn) {
        return null;
    }

    return renderFn({
        filteredTasks,
        filter,
        sort,
        setFilter,
        setSort,
        resetFilters,
    });
};

TaskListWithRenderProps.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string,
        description: PropTypes.string,
        category: PropTypes.string,
        priority: PropTypes.string,
        deadline: PropTypes.string,
        createdAt: PropTypes.string,
        completed: PropTypes.bool,
        tags: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,
    render: PropTypes.func,
    children: PropTypes.func,
    initialFilter: PropTypes.shape({
        search: PropTypes.string,
        status: PropTypes.string,
        category: PropTypes.string,
        priority: PropTypes.string,
    }),
    initialSort: PropTypes.shape({
        by: PropTypes.string,
        direction: PropTypes.oneOf(['asc', 'desc']),
    }),
};

export default TaskListWithRenderProps;
