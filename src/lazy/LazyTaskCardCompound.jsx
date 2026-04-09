import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';

const TaskCardCompound = lazy(() => import('../components/TaskCardCompound'));

const LazyTaskCardCompound = (props) => (
    <Suspense
        fallback={(
            <div className="h-full animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-card">
                <div className="h-5 w-2/3 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="mt-4 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="mt-2 h-3 w-3/4 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="mt-6 h-9 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
            </div>
        )}
    >
        <TaskCardCompound {...props} />
    </Suspense>
);

LazyTaskCardCompound.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
};

export default LazyTaskCardCompound;
