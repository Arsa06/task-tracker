import { renderHook, act } from '@testing-library/react';
import { useForm } from '../useForm';

describe('useForm Hook', () => {
    it('should initialize with provided values', () => {
        const { result } = renderHook(() => useForm({ name: 'John', age: 25 }));
        expect(result.current.values).toEqual({ name: 'John', age: 25 });
    });

    it('should handle value changes', () => {
        const { result } = renderHook(() => useForm({ name: '' }));
        
        act(() => {
            result.current.handleChange({
                target: { name: 'name', value: 'Jane', type: 'text' }
            });
        });

        expect(result.current.values.name).toBe('Jane');
    });

    it('should handle checkbox changes correctly', () => {
        const { result } = renderHook(() => useForm({ isAdult: false }));
        
        act(() => {
            result.current.handleChange({
                target: { name: 'isAdult', checked: true, type: 'checkbox' }
            });
        });

        expect(result.current.values.isAdult).toBe(true);
    });

    it('should reset form', () => {
        const { result } = renderHook(() => useForm({ name: 'Old' }));
        
        act(() => {
            result.current.setValue('name', 'New');
        });
        expect(result.current.values.name).toBe('New');

        act(() => {
            result.current.resetForm();
        });
        expect(result.current.values.name).toBe('Old');
    });
});
