import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, CircularProgress } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Import the ExitToApp icon
import { useThemeContext } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth to get the logout function
import { BoardProvider } from './contexts/BoardContext';
import Sidebar from './components/Sidebar'; // Import the new Sidebar component

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const BoardPage = React.lazy(() => import('./pages/BoardPage'));
const EditTaskPage = React.lazy(() => import('./pages/EditTaskPage'));
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));

function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <CircularProgress />;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
    const { mode, toggleColorMode } = useThemeContext();
    const { isAuthenticated, logout } = useAuth(); // Get user from useAuth and logout function
    const [open, setOpen] = useState(true); // Manages the permanent state of the sidebar

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Link
                        to="/dashboard"
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: 1,
                        }}
                    >
                        <img src="/avatar.png" alt="Yokan Logo" style={{ marginRight: '8px', width: '28px', height: '28px', borderRadius: '50%' }} />
                        <Typography variant="h6" component="div" noWrap>
                            Yokan
                        </Typography>
                    </Link>
                    {!isAuthenticated ? (
                        <>
                            <Button color="inherit" component={Link} to="/login">
                                Login
                            </Button>
                            <Button color="inherit" component={Link} to="/signup">
                                Signup
                            </Button>
                        </>
                    ) : (
                        <>
                            <IconButton sx={{ ml: 1, mr: 1 }} onClick={toggleColorMode} color="inherit">
                                {mode === 'dark' ? <LightModeIcon /> : <NightlightRoundIcon />}
                            </IconButton>
                            <IconButton color="inherit" onClick={logout}>
                                <ExitToAppIcon />
                            </IconButton>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            {isAuthenticated && <Sidebar open={open} setOpen={setOpen} />}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Suspense fallback={<CircularProgress />}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <DashboardPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/board/:id"
                            element={
                                <PrivateRoute>
                                    <BoardPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/task/edit/:boardId/:taskId"
                            element={
                                <PrivateRoute>
                                    <EditTaskPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/account"
                            element={
                                <PrivateRoute>
                                    <AccountPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/about"
                            element={
                                <PrivateRoute>
                                    <AboutPage />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/dashboard" />} /> {/* Default route to dashboard */}
                    </Routes>
                </Suspense>
            </Box>
        </Box>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <BoardProvider>
                    <AppContent />
                </BoardProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
