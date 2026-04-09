import { useState, useCallback } from 'react';

export function useModal(initialState = false) {
    const [isOpen, setIsOpen] = useState(initialState);
    const [modalData, setModalData] = useState(null);

    const open = useCallback((data = null) => {
        setModalData(data);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setModalData(null);
    }, []);

    return {
        isOpen,
        modalData,
        open,
        close
    };
}
