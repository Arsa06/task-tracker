import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, RotateCcw, Tag, Type, AlignLeft, X } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { NotificationContext } from '../context/NotificationContext';
import { useForm } from '../hooks/useForm';
import { useAI } from '../hooks/useAI';
import { Button, Badge } from '../components/ui/Base';

const MIN_TITLE_LENGTH = 3;

const formatDeadlineForInput = (deadline) => {
    if (!deadline) {
        return '';
    }

    const parsedDate = new Date(deadline);

    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const buildAuxiliaryValues = (initialData) => ({
    category: initialData?.category || 'Work',
    priority: initialData?.priority || 'Medium',
    deadline: formatDeadlineForInput(initialData?.deadline),
    tags: initialData?.tags || [],
});

const createErrorState = (title = '', description = '', deadline = '') => ({
    title,
    description,
    deadline,
});

const getCharactersRemainingLabel = (remainingCharacters) => (
    `${remainingCharacters} more character${remainingCharacters === 1 ? '' : 's'} needed.`
);

const HybridTaskForm = ({ initialData = null, buttonText = 'Add Task', onSuccess }) => {
    const { addTask, updateTask, isMutating } = useTaskContext();
    const notificationApi = useContext(NotificationContext);
    const descriptionRef = useRef(null);
    const suggestionRequestRef = useRef(0);
    const isEditMode = Boolean(initialData?.id);
    const initialDescription = useMemo(() => initialData?.description || '', [initialData]);
    const initialDeadlineValue = useMemo(
        () => formatDeadlineForInput(initialData?.deadline),
        [initialData],
    );
    const [title, setTitle] = useState(initialData?.title || '');
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState(createErrorState());
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiSuggestionNotice, setAiSuggestionNotice] = useState('');
    const notify = notificationApi?.notify;
    const {
        apiKeyConfigured,
        suggestTaskMetadata,
        suggestionLoading,
    } = useAI();

    const {
        values,
        handleChange,
        setValue,
        setAllValues,
    } = useForm(buildAuxiliaryValues(initialData));

    useEffect(() => {
        setTitle(initialData?.title || '');
        setTagInput('');
        setErrors(createErrorState());
        setAiSuggestion(null);
        setAiSuggestionNotice('');
        setAllValues(buildAuxiliaryValues(initialData));

        if (descriptionRef.current) {
            descriptionRef.current.value = initialData?.description || '';
        }
    }, [initialData, setAllValues]);

    const validateTitle = useCallback((valueToValidate) => {
        const trimmedTitle = valueToValidate.trim();

        if (!trimmedTitle) {
            return 'Title is required.';
        }

        if (trimmedTitle.length < MIN_TITLE_LENGTH) {
            const remainingCharacters = MIN_TITLE_LENGTH - trimmedTitle.length;
            return `Title should contain at least ${MIN_TITLE_LENGTH} characters. ${getCharactersRemainingLabel(remainingCharacters)}`;
        }

        return '';
    }, []);

    const validateDescription = useCallback(() => {
        const descriptionValue = descriptionRef.current?.value.trim() || '';

        if (descriptionValue && descriptionValue.length < 5) {
            return 'Description should contain at least 5 characters.';
        }

        return '';
    }, []);

    const validateDeadline = useCallback((valueToValidate) => {
        if (!valueToValidate) {
            return '';
        }

        if (isEditMode && valueToValidate === initialDeadlineValue) {
            return '';
        }

        const currentMinuteValue = formatDeadlineForInput(new Date());

        if (valueToValidate < currentMinuteValue) {
            return 'Deadline cannot be in the past.';
        }

        return '';
    }, [initialDeadlineValue, isEditMode]);

    const handleTitleChange = useCallback((event) => {
        const nextTitle = event.target.value;
        setTitle(nextTitle);
        setErrors((currentErrors) => ({
            ...currentErrors,
            title: validateTitle(nextTitle),
        }));
    }, [validateTitle]);

    const handleDeadlineChange = useCallback((event) => {
        handleChange(event);
        setErrors((currentErrors) => ({
            ...currentErrors,
            deadline: validateDeadline(event.target.value),
        }));
    }, [handleChange, validateDeadline]);

    const validateForm = useCallback(() => {
        const titleError = validateTitle(title);
        const descriptionError = validateDescription();
        const deadlineError = validateDeadline(values.deadline);

        setErrors(createErrorState(titleError, descriptionError, deadlineError));

        return !titleError && !descriptionError && !deadlineError;
    }, [title, validateDeadline, validateDescription, validateTitle, values.deadline]);

    const handleDescriptionBlur = useCallback(() => {
        setErrors((currentErrors) => ({
            ...currentErrors,
            description: validateDescription(),
        }));
    }, [validateDescription]);

    const handleDeadlineBlur = useCallback(() => {
        setErrors((currentErrors) => ({
            ...currentErrors,
            deadline: validateDeadline(values.deadline),
        }));
    }, [validateDeadline, values.deadline]);

    const resetHybridForm = useCallback(() => {
        setTitle(initialData?.title || '');
        setTagInput('');
        setErrors(createErrorState());
        setAiSuggestion(null);
        setAiSuggestionNotice('');
        setAllValues(buildAuxiliaryValues(initialData));

        if (descriptionRef.current) {
            descriptionRef.current.value = initialData?.description || '';
        }
    }, [initialData, setAllValues]);

    const addTag = useCallback(() => {
        const sanitizedTag = tagInput.trim();

        if (!sanitizedTag || values.tags.includes(sanitizedTag)) {
            return;
        }

        setValue('tags', [...values.tags, sanitizedTag]);
        setTagInput('');
    }, [setValue, tagInput, values.tags]);

    const removeTag = useCallback((tagToRemove) => {
        setValue('tags', values.tags.filter((tag) => tag !== tagToRemove));
    }, [setValue, values.tags]);

    const handleTagKeyDown = useCallback((event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addTag();
        }
    }, [addTag]);

    useEffect(() => {
        const trimmedTitle = title.trim();

        if (trimmedTitle.length < MIN_TITLE_LENGTH) {
            suggestionRequestRef.current += 1;
            setAiSuggestion(null);
            setAiSuggestionNotice('');
            return undefined;
        }

        const currentRequestId = suggestionRequestRef.current + 1;
        suggestionRequestRef.current = currentRequestId;

        const timeoutId = window.setTimeout(async () => {
            const nextSuggestion = await suggestTaskMetadata(trimmedTitle);

            if (!nextSuggestion || suggestionRequestRef.current !== currentRequestId) {
                return;
            }

            setAiSuggestion({
                category: nextSuggestion.category,
                priority: nextSuggestion.priority,
                reason: nextSuggestion.reason,
            });
            setAiSuggestionNotice(nextSuggestion.notice || '');
        }, 1000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [suggestTaskMetadata, title]);

    const applySuggestion = useCallback(() => {
        if (!aiSuggestion) {
            return;
        }

        setValue('category', aiSuggestion.category);
        setValue('priority', aiSuggestion.priority);
    }, [aiSuggestion, setValue]);

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            if (notify) {
                notify('Error: Please fill all required fields', { variant: 'error' });
            }
            return;
        }

        const descriptionValue = descriptionRef.current?.value.trim() || '';
        const taskPayload = {
            title: title.trim(),
            description: descriptionValue,
            category: values.category,
            priority: values.priority,
            deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
            tags: values.tags,
        };

        let savedTask;

        if (isEditMode) {
            savedTask = await updateTask({ ...initialData, ...taskPayload });
        } else {
            savedTask = await addTask(taskPayload);
        }

        if (!savedTask) {
            return;
        }

        if (!isEditMode) {
            resetHybridForm();
        }

        if (onSuccess) {
            onSuccess();
        }
    }, [
        addTask,
        isEditMode,
        initialData,
        onSuccess,
        resetHybridForm,
        title,
        updateTask,
        validateForm,
        values.category,
        values.deadline,
        values.priority,
        values.tags,
        notify,
    ]);

    const categories = ['Work', 'Study', 'Personal', 'Health'];
    const priorities = ['High', 'Medium', 'Low'];
    const currentMinuteValue = formatDeadlineForInput(new Date());
    const deadlineInputMin = !isEditMode || !initialDeadlineValue || initialDeadlineValue >= currentMinuteValue
        ? currentMinuteValue
        : undefined;

    return (
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="hybrid-task-form" aria-busy={isMutating}>
            <div className="space-y-4">
                <div className="relative">
                    <label htmlFor="task-title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                        Title
                    </label>
                    <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="task-title"
                            type="text"
                            name="title"
                            value={title}
                            onChange={handleTitleChange}
                            onBlur={() => {
                                setErrors((currentErrors) => ({
                                    ...currentErrors,
                                    title: validateTitle(title),
                                }));
                            }}
                            placeholder="Task title..."
                            aria-invalid={Boolean(errors.title)}
                            className={`w-full rounded-xl border bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all dark:bg-gray-900 ${
                                errors.title
                                    ? 'border-red-500'
                                    : 'border-transparent focus:border-accent'
                            }`}
                        />
                    </div>
                    {errors.title && (
                        <p className="mt-2 text-sm font-medium text-red-500" role="alert">
                            {errors.title}
                        </p>
                    )}
                    {title.trim().length >= MIN_TITLE_LENGTH && (
                        <div className="mt-3 rounded-2xl border border-accent/15 bg-accent/5 px-4 py-3">
                            {suggestionLoading ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    AI is analyzing the title...
                                </p>
                            ) : aiSuggestion ? (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold text-accent">AI suggests:</span>
                                        <Badge variant="primary">{aiSuggestion.category}</Badge>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <Badge
                                            variant={
                                                aiSuggestion.priority === 'High'
                                                    ? 'danger'
                                                    : aiSuggestion.priority === 'Medium'
                                                        ? 'warning'
                                                        : 'success'
                                            }
                                        >
                                            {aiSuggestion.priority} priority
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={applySuggestion}
                                            className="rounded-2xl"
                                        >
                                            Apply suggestion
                                        </Button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {aiSuggestion.reason}
                                        </p>
                                    </div>
                                    {aiSuggestionNotice && (
                                        <p className="text-xs text-orange-600 dark:text-orange-300">
                                            {apiKeyConfigured ? aiSuggestionNotice : 'Demo AI mode is active until you add a Claude API key.'}
                                        </p>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="task-description" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                        Description
                    </label>
                    <div className="relative">
                        <AlignLeft className="absolute left-4 top-4 text-gray-400" size={18} />
                        <textarea
                            id="task-description"
                            name="description"
                            ref={descriptionRef}
                            defaultValue={initialDescription}
                            onBlur={handleDescriptionBlur}
                            placeholder="Enter task description..."
                            aria-invalid={Boolean(errors.description)}
                            className={`min-h-[120px] w-full resize-none rounded-xl border bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all dark:bg-gray-900 ${
                                errors.description
                                    ? 'border-red-500'
                                    : 'border-transparent focus:border-accent'
                            }`}
                        />
                    </div>
                    {errors.description && (
                        <p className="mt-2 text-sm font-medium text-red-500" role="alert">
                            {errors.description}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="task-category" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                            Category
                        </label>
                        <select
                            id="task-category"
                            name="category"
                            value={values.category}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 outline-none transition-all focus:border-accent dark:bg-gray-900"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="task-priority" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                            Priority
                        </label>
                        <select
                            id="task-priority"
                            name="priority"
                            value={values.priority}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 outline-none transition-all focus:border-accent dark:bg-gray-900"
                        >
                            {priorities.map((priority) => (
                                <option key={priority} value={priority}>
                                    {priority}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="task-deadline" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                        Deadline
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="task-deadline"
                            type="datetime-local"
                            name="deadline"
                            value={values.deadline}
                            min={deadlineInputMin}
                            onChange={handleDeadlineChange}
                            onBlur={handleDeadlineBlur}
                            aria-invalid={Boolean(errors.deadline)}
                            className={`w-full rounded-xl border bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all dark:bg-gray-900 ${
                                errors.deadline
                                    ? 'border-red-500'
                                    : 'border-transparent focus:border-accent'
                            }`}
                        />
                    </div>
                    {errors.deadline && (
                        <p className="mt-2 text-sm font-medium text-red-500" role="alert">
                            {errors.deadline}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="task-tags" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                        Tags
                    </label>
                    <div className="mb-3 flex flex-wrap gap-2">
                        {values.tags.map((tag) => (
                            <Badge key={tag} className="flex items-center gap-1 py-1 pr-1">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-red-500"
                                    aria-label={`Remove ${tag}`}
                                >
                                    <X size={10} />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="task-tags"
                            type="text"
                            value={tagInput}
                            onChange={(event) => setTagInput(event.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Press Enter to add tags"
                            className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all focus:border-accent dark:bg-gray-900"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <Button type="button" variant="secondary" onClick={resetHybridForm} disabled={isMutating}>
                    <RotateCcw size={16} />
                    Reset
                </Button>
                {onSuccess && (
                    <Button type="button" variant="ghost" onClick={onSuccess} disabled={isMutating}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" className="px-8" disabled={isMutating}>
                    {buttonText}
                </Button>
            </div>
        </form>
    );
};

HybridTaskForm.propTypes = {
    initialData: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        description: PropTypes.string,
        category: PropTypes.string,
        priority: PropTypes.string,
        deadline: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        completed: PropTypes.bool,
        createdAt: PropTypes.string,
    }),
    buttonText: PropTypes.string,
    onSuccess: PropTypes.func,
};

export default HybridTaskForm;
