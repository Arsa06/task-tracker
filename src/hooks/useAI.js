import { useCallback, useMemo, useState } from 'react';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-opus-4-6';
const ANTHROPIC_API_KEY = 'YOUR_API_KEY';
const AI_KEY_INSTRUCTIONS = "Replace 'YOUR_API_KEY' in src/hooks/useAI.js with your real Anthropic Claude API key to enable live AI responses.";

const priorityWeight = {
    High: 0,
    Medium: 1,
    Low: 2,
};

const isApiKeyConfigured = () => ANTHROPIC_API_KEY !== 'YOUR_API_KEY';

const sortTasksForFocus = (tasks) => [...tasks].sort((leftTask, rightTask) => {
    const priorityDifference = (priorityWeight[leftTask.priority] ?? 99) - (priorityWeight[rightTask.priority] ?? 99);

    if (priorityDifference !== 0) {
        return priorityDifference;
    }

    if (leftTask.deadline && rightTask.deadline) {
        return new Date(leftTask.deadline).getTime() - new Date(rightTask.deadline).getTime();
    }

    if (leftTask.deadline) {
        return -1;
    }

    if (rightTask.deadline) {
        return 1;
    }

    return String(leftTask.title).localeCompare(String(rightTask.title));
});

const stringifyTask = (task) => (
    `${task.title} (${task.category || 'General'}, ${task.priority || 'Medium'} priority)`
);

const buildTaskSuggestionResponse = (tasks) => {
    const openTasks = sortTasksForFocus(tasks.filter((task) => !task.completed)).slice(0, 3);

    if (openTasks.length === 0) {
        return 'You already cleared your current task list, so today is perfect for planning tomorrow, reviewing goals, and adding one meaningful stretch task. Keep the momentum going with a quick reflection before you log off.';
    }

    const suggestions = openTasks.map(stringifyTask).join(', ');
    return `A strong plan for today is to focus on ${suggestions}. That order gives you the highest-impact work first while keeping at least one achievable win in the mix.`;
};

const buildProductivityResponse = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (totalTasks === 0) {
        return 'Your workspace is still empty, which is a great chance to define three clear tasks and build momentum from zero. Start with one quick win, one important task, and one task that protects your next deadline.';
    }

    const momentumMessage = completionRate >= 70
        ? 'Your productivity looks strong and consistent right now.'
        : completionRate >= 40
            ? 'You are building solid momentum, but there is still room to tighten focus.'
            : 'Your completion rate is still warming up, so reducing task switching will help quickly.';

    return `You have completed ${completedTasks} of ${totalTasks} tasks, which puts your productivity score at ${completionRate}%. ${momentumMessage} The next best move is to finish one high-priority open task before adding anything new.`;
};

const buildPrioritizationResponse = (tasks) => {
    const openTasks = sortTasksForFocus(tasks.filter((task) => !task.completed)).slice(0, 3);

    if (openTasks.length === 0) {
        return 'There are no active tasks to prioritize right now, so your best move is to plan the next set of goals and protect your energy for tomorrow. A short review session would be more valuable than forcing busywork.';
    }

    return `Start with ${openTasks[0].title}${openTasks[1] ? `, then move to ${openTasks[1].title}` : ''}${openTasks[2] ? `, and keep ${openTasks[2].title} as your third priority` : ''}. That sequence balances urgency, impact, and the chance of finishing your most important work before the day gets noisy.`;
};

const buildGeneralResponse = (tasks, userMessage) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const nextTask = sortTasksForFocus(tasks.filter((task) => !task.completed))[0];

    if (!nextTask) {
        return `You asked: "${userMessage}". With everything currently wrapped up, this is a good moment to capture your next three priorities and decide what would make tomorrow feel successful.`;
    }

    return `You asked: "${userMessage}". Right now you have ${totalTasks} total tasks with ${completedTasks} completed, and your best next focus is ${nextTask.title}. If you want, you can use the quick actions to get a more specific plan for today or a prioritization pass.`;
};

const buildFallbackAssistantResponse = ({ tasks, userMessage }) => {
    const normalizedMessage = userMessage.toLowerCase();

    if (normalizedMessage.includes('suggest')) {
        return buildTaskSuggestionResponse(tasks);
    }

    if (normalizedMessage.includes('analyze') || normalizedMessage.includes('productivity')) {
        return buildProductivityResponse(tasks);
    }

    if (normalizedMessage.includes('prioritize') || normalizedMessage.includes('priority')) {
        return buildPrioritizationResponse(tasks);
    }

    return buildGeneralResponse(tasks, userMessage);
};

const extractAnthropicText = (data) => {
    if (!Array.isArray(data?.content)) {
        return '';
    }

    return data.content
        .filter((contentBlock) => contentBlock?.type === 'text')
        .map((contentBlock) => contentBlock.text)
        .join('\n')
        .trim();
};

const requestClaude = async (message) => {
    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: message,
            }],
        }),
    });

    if (!response.ok) {
        throw new Error(`Claude request failed with status ${response.status}`);
    }

    const data = await response.json();

    return extractAnthropicText(data);
};

const detectCategory = (title) => {
    const normalizedTitle = title.toLowerCase();

    if (/study|exam|quiz|course|lecture|homework|assignment|read|practice|learn/.test(normalizedTitle)) {
        return 'Study';
    }

    if (/gym|run|health|doctor|sleep|water|walk|yoga|workout|meal/.test(normalizedTitle)) {
        return 'Health';
    }

    if (/meeting|client|project|deploy|email|design|report|ticket|bug|presentation|dashboard/.test(normalizedTitle)) {
        return 'Work';
    }

    return 'Personal';
};

const detectPriority = (title) => {
    const normalizedTitle = title.toLowerCase();

    if (/urgent|asap|today|now|final|exam|deadline|submit|pay|important|client/.test(normalizedTitle)) {
        return 'High';
    }

    if (/plan|draft|review|prepare|organize|update|practice/.test(normalizedTitle)) {
        return 'Medium';
    }

    return 'Low';
};

const buildFallbackTaskMetadata = (title) => {
    const category = detectCategory(title);
    const priority = detectPriority(title);

    return {
        category,
        priority,
        reason: `${category} fits the keywords in the title, and ${priority.toLowerCase()} priority matches the urgency cues.`,
        source: 'local',
    };
};

const parseMetadataResponse = (responseText) => {
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

        return {
            category: parsed.category,
            priority: parsed.priority,
            reason: parsed.reason,
        };
    } catch {
        return null;
    }
};

export const useAI = () => {
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [error, setError] = useState('');

    const apiKeyConfigured = useMemo(() => isApiKeyConfigured(), []);

    const askAssistant = useCallback(async ({
        tasks,
        userMessage,
        history = [],
    }) => {
        setAssistantLoading(true);
        setError('');

        const fallbackText = buildFallbackAssistantResponse({ tasks, userMessage });

        try {
            if (!apiKeyConfigured) {
                return {
                    text: fallbackText,
                    source: 'local',
                    notice: AI_KEY_INSTRUCTIONS,
                };
            }

            const conversationContext = history
                .slice(-6)
                .map((message) => `${message.role}: ${message.content}`)
                .join('\n');
            const completedTasks = tasks.filter((task) => task.completed).length;
            const prompt = `You are a productivity assistant for a task tracker app.
User has ${tasks.length} tasks and ${completedTasks} completed tasks.
Task list sample: ${JSON.stringify(tasks.slice(0, 5))}
Recent conversation:
${conversationContext || 'No previous conversation'}
User question: ${userMessage}
Give a helpful, concise response in 2-3 sentences.`;
            const liveResponse = await requestClaude(prompt);

            return {
                text: liveResponse || fallbackText,
                source: 'anthropic',
            };
        } catch (requestError) {
            setError(requestError.message);

            return {
                text: fallbackText,
                source: 'local',
                notice: requestError.message,
            };
        } finally {
            setAssistantLoading(false);
        }
    }, [apiKeyConfigured]);

    const suggestTaskMetadata = useCallback(async (title) => {
        const trimmedTitle = title.trim();

        if (trimmedTitle.length < 3) {
            return null;
        }

        setSuggestionLoading(true);
        setError('');

        const fallbackMetadata = buildFallbackTaskMetadata(trimmedTitle);

        try {
            if (!apiKeyConfigured) {
                return {
                    ...fallbackMetadata,
                    notice: AI_KEY_INSTRUCTIONS,
                };
            }

            const prompt = `You are categorizing a task in a productivity app.
Task title: "${trimmedTitle}"
Choose one category from: Work, Study, Personal, Health.
Choose one priority from: High, Medium, Low.
Return valid JSON only in this shape:
{"category":"Study","priority":"High","reason":"Short explanation"}`;
            const liveResponse = await requestClaude(prompt);
            const parsedMetadata = parseMetadataResponse(liveResponse);

            if (!parsedMetadata?.category || !parsedMetadata?.priority) {
                return fallbackMetadata;
            }

            return {
                category: parsedMetadata.category,
                priority: parsedMetadata.priority,
                reason: parsedMetadata.reason,
                source: 'anthropic',
            };
        } catch (requestError) {
            setError(requestError.message);

            return {
                ...fallbackMetadata,
                notice: requestError.message,
            };
        } finally {
            setSuggestionLoading(false);
        }
    }, [apiKeyConfigured]);

    return {
        apiKeyConfigured,
        configurationHint: AI_KEY_INSTRUCTIONS,
        assistantLoading,
        suggestionLoading,
        error,
        askAssistant,
        suggestTaskMetadata,
    };
};

export default useAI;
