import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';

const Modal = lazy(() => import('../components/ui/Modal'));

const LazyModal = ({ isOpen, fallback, ...props }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Suspense fallback={fallback}>
            <Modal isOpen={isOpen} {...props} />
        </Suspense>
    );
};

LazyModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    fallback: PropTypes.node,
};

LazyModal.defaultProps = {
    fallback: (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="h-48 w-full max-w-2xl animate-pulse rounded-3xl bg-white/90 shadow-2xl dark:bg-dark-card/90" />
        </div>
    ),
};

export default LazyModal;
