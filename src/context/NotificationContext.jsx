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

export const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }

    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const timeoutRef = useRef(null);

    const dismissNotification = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setNotification(null);
    }, []);

    const notify = useCallback((message, options = {}) => {
        dismissNotification();

        setNotification({
            id: Date.now(),
            message,
            variant: options.variant || 'success',
        });

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            setNotification(null);
        }, options.duration || 3000);
    }, [dismissNotification]);

    useEffect(() => () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    const value = useMemo(() => ({
        notification,
        notify,
        dismissNotification,
    }), [notification, notify, dismissNotification]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <ToastViewport toast={notification} onDismiss={dismissNotification} />
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
