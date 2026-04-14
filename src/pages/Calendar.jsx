import React, { useState } from 'react';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    parseISO,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import {
    AlertCircle,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Plus,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Card, Button } from '../components/ui/Base';
import LazyModal from '../lazy/LazyModal';
import TaskForm from '../components/TaskForm';
import { useModal } from '../hooks/useModal';

const CalendarView = () => {
    const { tasks, loading } = useTaskContext();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const addModal = useModal(false);
    const editModal = useModal(false);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const tasksOnSelectedDate = tasks.filter((task) => (
        task.deadline && isSameDay(parseISO(task.deadline), selectedDate)
    ));

    const getTasksForDate = (date) => tasks.filter((task) => (
        task.deadline && isSameDay(parseISO(task.deadline), date)
    ));

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-12 w-60 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                    <div className="h-[520px] rounded-3xl bg-gray-100 dark:bg-gray-800 xl:col-span-2" />
                    <div className="h-[520px] rounded-3xl bg-gray-100 dark:bg-gray-800" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-3xl font-bold font-outfit text-gray-900 dark:text-white md:text-4xl">
                        <CalendarIcon size={28} className="text-accent" />
                        Calendar
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 md:text-base">Plan your schedule visually.</p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-dark-card">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="min-w-[140px] text-center text-lg font-bold font-outfit">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <Card className="overflow-hidden border-none shadow-xl xl:col-span-2">
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day) => {
                            const dateTasks = getTasksForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`min-h-[92px] cursor-pointer border-b border-r border-gray-50 p-2 transition-all dark:border-gray-800 sm:min-h-[100px] ${
                                        !isCurrentMonth ? 'opacity-30' : ''
                                    } ${
                                        isSelected ? 'bg-accent/5 ring-2 ring-inset ring-accent' : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                                    }`}
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold ${
                                            isToday(day) ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {format(day, 'd')}
                                        </span>
                                        {dateTasks.length > 0 && (
                                            <div className="flex gap-1">
                                                {dateTasks.some((task) => task.priority === 'High') && <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                                                {dateTasks.some((task) => task.completed) && <div className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {dateTasks.slice(0, 2).map((task) => (
                                            <div key={task.id} className="truncate rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {task.title}
                                            </div>
                                        ))}
                                        {dateTasks.length > 2 && (
                                            <div className="text-center text-[9px] font-bold text-accent">
                                                + {dateTasks.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="border-accent/20 bg-accent/5 p-4 md:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                                    {format(selectedDate, 'EEEE')}
                                </h3>
                                <p className="text-sm text-gray-500">{format(selectedDate, 'MMMM d, yyyy')}</p>
                            </div>
                            <Button onClick={() => addModal.open()} size="sm" className="rounded-xl">
                                <Plus size={16} /> Add
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {tasksOnSelectedDate.length > 0 ? tasksOnSelectedDate.map((task) => (
                                <div key={task.id} onClick={() => editModal.open(task)} className="cursor-pointer">
                                    <Card className="group p-4 hover:border-accent">
                                        <div className="flex gap-3">
                                            <div className={`h-10 w-1 rounded-full ${
                                                task.priority === 'High'
                                                    ? 'bg-red-500'
                                                    : task.priority === 'Medium'
                                                        ? 'bg-orange-500'
                                                        : 'bg-green-500'
                                            }`} />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">{task.title}</h4>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <span className="text-[10px] text-gray-500">{format(parseISO(task.deadline), 'p')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )) : (
                                <div className="py-10 text-center opacity-50">
                                    <AlertCircle size={32} className="mx-auto mb-2" />
                                    <p className="text-sm font-medium">
                                        {isToday(selectedDate)
                                            ? `No tasks for today. Enjoy your day! ${'\uD83C\uDF89'}`
                                            : 'No tasks for this day.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-dark-card p-4 text-white md:p-6">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <CalendarIcon size={80} />
                        </div>
                        <h4 className="mb-4 flex items-center gap-2 font-bold">Month Overview</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase opacity-60">Total Tasks</span>
                                <p className="text-2xl font-bold">
                                    {tasks.filter((task) => task.deadline && isSameMonth(parseISO(task.deadline), currentMonth)).length}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase opacity-60">Completed</span>
                                <p className="text-2xl font-bold text-green-400">
                                    {tasks.filter((task) => task.deadline && isSameMonth(parseISO(task.deadline), currentMonth) && task.completed).length}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <LazyModal isOpen={addModal.isOpen} onClose={addModal.close} title="Quick Add Task">
                <TaskForm initialData={{ deadline: selectedDate.toISOString() }} onSuccess={addModal.close} />
            </LazyModal>
            <LazyModal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Task">
                {editModal.modalData && (
                    <TaskForm initialData={editModal.modalData} buttonText="Update" onSuccess={editModal.close} />
                )}
            </LazyModal>
        </div>
    );
};

export default CalendarView;
