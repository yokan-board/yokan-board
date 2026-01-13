import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, useParams, useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import App from './App';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BoardProvider } from './contexts/BoardContext';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const BoardPage = React.lazy(() => import('./pages/BoardPage'));
const EditTaskPage = React.lazy(() => import('./pages/EditTaskPage'));
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const JournalPage = React.lazy(() => import('./pages/JournalPage'));

function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <CircularProgress />;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

const BoardPageWithKey = () => {
    const { id } = useParams();
    const location = useLocation();
    return <BoardPage key={`${id}-${location.key}`} />;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: 'login',
                element: (
                    <Suspense fallback={<CircularProgress />}>
                        <LoginPage />
                    </Suspense>
                ),
            },
            {
                path: 'signup',
                element: (
                    <Suspense fallback={<CircularProgress />}>
                        <SignupPage />
                    </Suspense>
                ),
            },
            {
                path: 'dashboard',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<CircularProgress />}>
                            <DashboardPage />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            {
                path: 'board/:id',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<CircularProgress />}>
                            <BoardPageWithKey />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            {
                path: 'task/edit/:boardId/:taskId',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<CircularProgress />}>
                            <EditTaskPage />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            {
                path: 'account',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<CircularProgress />}>
                            <AccountPage />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            {
                path: 'about',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<CircularProgress />}>
                            <AboutPage />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            {
                path: 'journal',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<CircularProgress />}>
                            <JournalPage />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            {
                path: '/',
                element: <Navigate to="/dashboard" />,
            },
        ],
    },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeContextProvider>
            <AuthProvider>
                <BoardProvider>
                    <RouterProvider router={router} />
                </BoardProvider>
            </AuthProvider>
        </ThemeContextProvider>
    </React.StrictMode>
);
