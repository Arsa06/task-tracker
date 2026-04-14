import React, { Suspense, lazy } from 'react';
import {
    Navigate,
    Outlet,
    Route,
    Routes,
} from 'react-router-dom';
import Layout from './components/layout/Layout';
import { FilterProvider } from './context/FilterContext';
import { TaskProvider } from './context/TaskContext';
import { useAuth } from './context/AuthContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const Home = lazy(() => import('./pages/Home'));
const TaskTracker = lazy(() => import('./components/TaskTracker'));
const Profile = lazy(() => import('./pages/Profile'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));
const TaskEditPage = lazy(() => import('./pages/TaskEditPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const ProtectedAppShell = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <TaskProvider>
            <FilterProvider>
                <Layout>
                    <Outlet />
                </Layout>
            </FilterProvider>
        </TaskProvider>
    );
};

function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedAppShell />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/tasks" element={<TaskTracker />} />
                    <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
                    <Route path="/tasks/:taskId/edit" element={<TaskEditPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;
