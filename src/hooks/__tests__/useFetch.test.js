import { renderHook, act } from '@testing-library/react';
import { useFetch } from '../useFetch';

global.fetch = jest.fn();

describe('useFetch Hook', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and return data successfully', async () => {
        const mockData = { id: 1, title: 'Test Task' };
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        const { result } = renderHook(() => useFetch('http://localhost:5000/tasks'));

        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();

        // Wait for next update
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it('should handle API errors', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 404
        });

        const { result } = renderHook(() => useFetch('http://localhost:5000/tasks'));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe('HTTP error! status: 404');
    });
});
