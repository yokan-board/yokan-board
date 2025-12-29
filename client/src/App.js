import React, { useState, Suspense, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, CircularProgress } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Import the ExitToApp icon
import { useThemeContext } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext'; // Import useAuth to get the logout function
import Sidebar from './components/Sidebar'; // Import the new Sidebar component
import { setNavigateFunction } from './utils/authUtils'; // Import setNavigateFunction

function App() {
    const { mode, toggleColorMode } = useThemeContext();
    const { isAuthenticated, logout } = useAuth(); // Get user from useAuth and logout function
    const [open, setOpen] = useState(true); // Manages the permanent state of the sidebar
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setNavigateFunction(navigate);
    }, [navigate]);

    const handleLogout = () => {
        logout(); // No longer pass 'false'
        navigate('/login');
    };

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    const showSidebar = isAuthenticated && !isAuthPage;

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
                        <img
                            src="/avatar.png"
                            alt="Yokan Logo"
                            style={{ marginRight: '8px', width: '28px', height: '28px', borderRadius: '50%' }}
                        />
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
                            <IconButton color="inherit" onClick={handleLogout}>
                                <ExitToAppIcon />
                            </IconButton>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            {showSidebar && <Sidebar open={open} setOpen={setOpen} />}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Suspense fallback={<CircularProgress />}>
                    <Outlet />
                </Suspense>
            </Box>
        </Box>
    );
}

export default App;
