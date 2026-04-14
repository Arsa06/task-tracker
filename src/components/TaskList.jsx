import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { Layers } from 'lucide-react';

const TaskList = React.memo(({ tasks, onEdit }) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={onEdit}
                        />
                    ))
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800"
                    >
                        <Layers size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold font-outfit text-gray-400">No tasks found.</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters or add a new task!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default TaskList;
