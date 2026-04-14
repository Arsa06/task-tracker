import { NotificationProvider, useNotification } from './NotificationContext';

export const ToastProvider = NotificationProvider;

export const useToast = () => {
    const { dismissNotification, notification, notify } = useNotification();

    return {
        dismissToast: dismissNotification,
        toast: notification,
        showToast: notify,
    };
};
