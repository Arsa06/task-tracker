import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch(source, options = {}) {
    const {
        initialData = null,
        immediate = true,
        requestOptions = {},
    } = options;
    const requestOptionsRef = useRef(requestOptions);
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        requestOptionsRef.current = requestOptions;
    }, [requestOptions]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let result;

            if (typeof source === 'function') {
                result = await source();
            } else {
                const response = await fetch(source, requestOptionsRef.current);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                result = await response.json();
            }

            setData(result);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [source]);

    useEffect(() => {
        if (!immediate) {
            setLoading(false);
            return;
        }

        fetchData().catch(() => {
            // Errors are already stored in hook state.
        });
    }, [fetchData, immediate]);

    return { data, setData, loading, error, setError, refetch: fetchData };
}
