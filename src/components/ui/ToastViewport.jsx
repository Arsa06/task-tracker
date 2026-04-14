import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const toastVariants = {
    success: {
        container: 'border-emerald-400/40 bg-emerald-500 text-white shadow-emerald-500/25',
        icon: <CheckCircle2 size={18} className="text-white" />,
    },
    error: {
        container: 'border-red-400/40 bg-red-500 text-white shadow-red-500/25',
        icon: <AlertCircle size={18} className="text-white" />,
    },
    info: {
        container: 'border-blue-400/40 bg-blue-500 text-white shadow-blue-500/25',
        icon: <Info size={18} className="text-white" />,
    },
};

const ToastViewport = ({ toast, onDismiss }) => {
    return (
        <AnimatePresence>
            {toast ? (
                <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="fixed bottom-6 right-6 z-[70] w-[calc(100%-2rem)] max-w-sm"
                    role="status"
                    aria-live="polite"
                >
                    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${(toastVariants[toast.variant] || toastVariants.success).container}`}>
                        <div className="mt-0.5 shrink-0">
                            {(toastVariants[toast.variant] || toastVariants.success).icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{toast.message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                            aria-label="Dismiss notification"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

ToastViewport.propTypes = {
    toast: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        message: PropTypes.string.isRequired,
        variant: PropTypes.string,
    }),
    onDismiss: PropTypes.func.isRequired,
};

ToastViewport.defaultProps = {
    toast: null,
};

export default ToastViewport;
