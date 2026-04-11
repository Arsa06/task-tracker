import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import PropTypes from 'prop-types';
import ToastViewport from '../components/ui/ToastViewport';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const timeoutRef = useRef(null);

    const dismissToast = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setToast(null);
    }, []);

    const showToast = useCallback((message, options = {}) => {
        dismissToast();

        setToast({
            id: Date.now(),
            message,
            variant: options.variant || 'success',
        });

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            setToast(null);
        }, options.duration || 2500);
    }, [dismissToast]);

    useEffect(() => () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    const value = useMemo(() => ({
        dismissToast,
        showToast,
        toast,
    }), [dismissToast, showToast, toast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toast={toast} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
