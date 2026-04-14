import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Brain, SendHorizonal, Sparkles } from 'lucide-react';
import LazyModal from '../lazy/LazyModal';
import { useTaskContext } from '../context/TaskContext';
import { Badge, Button } from './ui/Base';
import { useAI } from '../hooks/useAI';

const starterPrompts = [
    'Suggest tasks for today',
    'Analyze my productivity',
    'Prioritize my tasks',
];

const initialMessage = {
    id: 'assistant-welcome',
    role: 'assistant',
    content: 'I can suggest tasks for today, analyze your productivity, prioritize your list, or answer questions about your Taskyy workspace.',
};

const AIAssistant = () => {
    const { tasks } = useTaskContext();
    const {
        apiKeyConfigured,
        askAssistant,
        assistantLoading,
        configurationHint,
    } = useAI();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([initialMessage]);
    const [notice, setNotice] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [assistantLoading, isOpen, messages]);

    const completedTaskCount = useMemo(
        () => tasks.filter((task) => task.completed).length,
        [tasks],
    );

    const submitMessage = useCallback(async (messageText) => {
        const trimmedMessage = messageText.trim();

        if (!trimmedMessage || assistantLoading) {
            return;
        }

        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmedMessage,
        };
        const nextHistory = [...messages, userMessage];

        setMessages(nextHistory);
        setInputValue('');

        const response = await askAssistant({
            tasks,
            userMessage: trimmedMessage,
            history: nextHistory,
        });

        if (response.notice) {
            setNotice(response.notice);
        } else {
            setNotice('');
        }

        setMessages((currentMessages) => ([
            ...currentMessages,
            {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response.text,
            },
        ]));
    }, [askAssistant, assistantLoading, messages, tasks]);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        submitMessage(inputValue);
    }, [inputValue, submitMessage]);

    return (
        <>
            <div className="fixed bottom-24 right-6 z-40 md:bottom-28 md:right-8">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-accent to-violet-600 text-white shadow-[0_20px_50px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-1 hover:scale-[1.03] active:scale-95"
                    aria-label="Open AI assistant"
                >
                    <Sparkles size={24} className="transition-transform group-hover:rotate-6" />
                </button>
            </div>

            <LazyModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Taskyy AI Assistant">
                <div className="space-y-5">
                    <div className="rounded-3xl bg-gradient-to-r from-accent/10 via-violet-500/10 to-indigo-500/10 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                                    <Brain size={22} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold font-outfit text-gray-900 dark:text-white">Task-focused AI copilot</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {completedTaskCount} completed out of {tasks.length} total tasks.
                                    </p>
                                </div>
                            </div>
                            <Badge variant={apiKeyConfigured ? 'success' : 'warning'} className="px-3 py-1 text-[11px]">
                                {apiKeyConfigured ? 'Claude live' : 'Demo AI mode'}
                            </Badge>
                        </div>

                        {!apiKeyConfigured && (
                            <p className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-600 dark:text-orange-300">
                                {configurationHint}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {starterPrompts.map((prompt) => (
                            <Button
                                key={prompt}
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => submitMessage(prompt)}
                                className="rounded-2xl"
                            >
                                {prompt}
                            </Button>
                        ))}
                    </div>

                    {notice && (
                        <div className="rounded-2xl border border-accent/15 bg-accent/5 px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {notice}
                        </div>
                    )}

                    <div className="max-h-[380px] space-y-4 overflow-y-auto rounded-3xl bg-gray-50 p-4 dark:bg-gray-950/60">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm ${
                                        message.role === 'user'
                                            ? 'bg-accent text-white'
                                            : 'border border-gray-100 bg-white text-gray-700 dark:border-gray-800 dark:bg-dark-card dark:text-gray-200'
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {assistantLoading && (
                            <div className="flex justify-start">
                                <div className="inline-flex items-center gap-3 rounded-3xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-dark-card dark:text-gray-300">
                                    <span className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                                    Claude is thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded-3xl border border-gray-100 bg-white p-2 dark:border-gray-800 dark:bg-dark-card">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            placeholder="Ask about your tasks, focus, or productivity..."
                            className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!inputValue.trim() || assistantLoading}
                            className="rounded-2xl px-4"
                        >
                            <SendHorizonal size={16} />
                            Send
                        </Button>
                    </form>
                </div>
            </LazyModal>
        </>
    );
};

export default AIAssistant;
