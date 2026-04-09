import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { TaskProvider } from './context/TaskContext';
import withAuth from './hoc/withAuth';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const TaskTracker = lazy(() => import('./components/TaskTracker')); // Will update this soon
const Profile = lazy(() => import('./pages/Profile')); // Will create this soon
const CalendarPage = lazy(() => import('./pages/Calendar')); // Will create this soon
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));
const TaskEditPage = lazy(() => import('./pages/TaskEditPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const ProtectedTaskDetailPage = withAuth(TaskDetailPage);
const ProtectedTaskEditPage = withAuth(TaskEditPage);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
);

function App() {
    return (
        <TaskProvider>
            <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        {/* More routes will be converted to better components soon */}
                        <Route path="/tasks" element={<TaskTracker />} />
                        <Route path="/tasks/:taskId" element={<ProtectedTaskDetailPage />} />
                        <Route path="/tasks/:taskId/edit" element={<ProtectedTaskEditPage />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </Layout>
        </TaskProvider>
    );
}

export default App;
