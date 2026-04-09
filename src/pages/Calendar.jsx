import React, { useState } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths,
    parseISO,
    isToday
} from 'date-fns';
import { useTaskContext } from '../context/TaskContext';
import { Card, Button, Badge } from '../components/ui/Base';
import { 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Calendar as CalendarIcon,
    Clock,
    AlertCircle
} from 'lucide-react';
import TaskItem from '../components/TaskItem';
import LazyModal from '../lazy/LazyModal';
import TaskForm from '../components/TaskForm';
import { useModal } from '../hooks/useModal';

const CalendarView = () => {
    const { tasks } = useTaskContext();
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

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const tasksOnSelectedDate = tasks.filter(task => 
        task.deadline && isSameDay(parseISO(task.deadline), selectedDate)
    );

    const getTasksForDate = (date) => {
        return tasks.filter(task => 
            task.deadline && isSameDay(parseISO(task.deadline), date)
        );
    };

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon size={28} className="text-accent" />
                        Calendar
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Plan your schedule visually.</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-dark-card p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-bold font-outfit min-w-[140px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Calendar Grid */}
                <Card className="xl:col-span-2 overflow-hidden border-none shadow-xl">
                    <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, idx) => {
                            const dateTasks = getTasksForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            
                            return (
                                <div 
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        min-h-[100px] p-2 border-r border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-all
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                        ${isSelected ? 'bg-accent/5 ring-2 ring-inset ring-accent' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`
                                            w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold
                                            ${isToday(day) ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-gray-500 dark:text-gray-400'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {dateTasks.length > 0 && (
                                            <div className="flex gap-1">
                                                {dateTasks.some(t => t.priority === 'High') && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                                {dateTasks.some(t => t.completed) && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {dateTasks.slice(0, 2).map(task => (
                                            <div key={task.id} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 truncate font-medium">
                                                {task.title}
                                            </div>
                                        ))}
                                        {dateTasks.length > 2 && (
                                            <div className="text-[9px] text-center text-accent font-bold">
                                                + {dateTasks.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Day Details */}
                <div className="space-y-6">
                    <Card className="p-6 border-accent/20 bg-accent/5">
                        <div className="flex items-center justify-between mb-4">
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
                            {tasksOnSelectedDate.length > 0 ? (
                                tasksOnSelectedDate.map(task => (
                                    <div key={task.id} onClick={() => editModal.open(task)} className="cursor-pointer">
                                        <Card className="p-4 hover:border-accent group">
                                            <div className="flex gap-3">
                                                <div className={`w-1 h-10 rounded-full ${
                                                    task.priority === 'High' ? 'bg-red-500' : 
                                                    task.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                                                }`} />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{task.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Clock size={12} className="text-gray-400" />
                                                        <span className="text-[10px] text-gray-500">{format(parseISO(task.deadline), 'p')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <AlertCircle size={32} className="mx-auto mb-2" />
                                    <p className="text-sm font-medium">No tasks for this day.</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Progress Card */}
                    <Card className="p-6 bg-dark-card border-none text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CalendarIcon size={80} />
                        </div>
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                             Month Overview
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold opacity-60">Total Tasks</span>
                                <p className="text-2xl font-bold">{tasks.filter((task) => task.deadline && isSameMonth(parseISO(task.deadline), currentMonth)).length}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold opacity-60">Completed</span>
                                <p className="text-2xl font-bold text-green-400">{tasks.filter((task) => task.deadline && isSameMonth(parseISO(task.deadline), currentMonth) && task.completed).length}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modals */}
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
