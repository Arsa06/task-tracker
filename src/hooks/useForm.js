import { useState, useCallback } from 'react';

export function useForm(initialValues) {
    const [values, setValues] = useState(initialValues);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const resetForm = useCallback(() => {
        setValues(initialValues);
    }, [initialValues]);

    const setValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    }, []);

    const setAllValues = useCallback((newValues) => {
        setValues(newValues);
    }, []);

    return {
        values,
        handleChange,
        resetForm,
        setValue,
        setAllValues
    };
}
