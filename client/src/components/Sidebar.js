import React, { useState, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
    Drawer as MuiDrawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Typography,
    IconButton,
    Divider,
    Toolbar,
    Tooltip,
} from '@mui/material';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import AdjustIcon from '@mui/icons-material/Adjust';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useAuth } from '../contexts/AuthContext';
import { useBoards } from '../contexts/BoardContext';
import md5 from 'md5';
import { VIRTUAL_ID_JOURNAL } from '../utils/constants';

const drawerWidth = '20rem';

const Sidebar = ({ open, setOpen }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { boards } = useBoards();
    const [boardsOpen, setBoardsOpen] = useState(true);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [temporaryOpen, setTemporaryOpen] = useState(false);

    const handleDrawerClose = (e) => {
        e.stopPropagation(); // Prevent the dashboard navigation from firing
        setOpen(false);
    };

    const handlePermanentOpen = (e) => {
        e.stopPropagation();
        setOpen(true);
    };

    const handleMouseEnter = () => {
        if (!open) {
            setTemporaryOpen(true);
        }
    };

    const handleMouseLeave = () => {
        setTemporaryOpen(false);
    };

    const isDrawerOpen = open || temporaryOpen;
    const collapsedWidth = `calc(${theme.spacing(7)} + 1px)`;

    const handleBoardsClick = () => {
        setBoardsOpen(!boardsOpen);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleItemClick = (path) => {
        if (temporaryOpen) {
            setTemporaryOpen(false);
        }
        navigate(path);
    };

    const gravatarUrl =
        user?.avatar_url ||
        (user?.email
            ? `https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}?d=identicon`
            : `https://www.gravatar.com/avatar/?d=identicon`);

    const groupedBoards = useMemo(() => {
        const groups = { Boards: [] }; // 'Boards' will be the default collection for unassigned boards

        // Prepend Kanban Journal virtual board
        groups.Boards.push({
            id: VIRTUAL_ID_JOURNAL,
            name: 'Kanban Journal',
            data: {
                description: 'Cross-board activity feed',
                gradientColors: ['#183F1E', '#56CD01'],
            },
            taskCount: boards.reduce((acc, b) => acc + (b.taskCount || 0), 0),
        });

        boards.forEach((board) => {
            const collectionName = board.collection || 'Boards'; // Use 'Boards' as default
            if (!groups[collectionName]) {
                groups[collectionName] = [];
            }
            groups[collectionName].push(board);
        });

        // Sort collection names alphabetically, with 'Boards' always first
        const sortedCollectionNames = Object.keys(groups).sort((a, b) => {
            if (a === 'Boards') return -1;
            if (b === 'Boards') return 1;
            return a.localeCompare(b);
        });

        const sortedGroups = {};
        sortedCollectionNames.forEach((name) => {
            sortedGroups[name] = groups[name];
        });

        return sortedGroups;
    }, [boards]);

    const drawerContent = (
        <>
            <Toolbar />
            <Divider />
            <List>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        onClick={() => handleItemClick('/dashboard')}
                        sx={{ minHeight: 48, justifyContent: isDrawerOpen ? 'initial' : 'center', px: 2.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center' }}>
                            <DashboardCustomizeOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Dashboard"
                            sx={{ opacity: isDrawerOpen ? 1 : 0, display: isDrawerOpen ? 'block' : 'none' }}
                        />
                        {isDrawerOpen && (
                            <IconButton onClick={open ? handleDrawerClose : handlePermanentOpen} sx={{ ml: 1 }}>
                                {open ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                            </IconButton>
                        )}
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        onClick={handleBoardsClick}
                        sx={{ minHeight: 48, justifyContent: isDrawerOpen ? 'initial' : 'center', px: 2.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center' }}>
                            <ViewKanbanOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Boards"
                            sx={{ opacity: isDrawerOpen ? 1 : 0, display: isDrawerOpen ? 'block' : 'none' }}
                        />
                        {isDrawerOpen ? boardsOpen ? <ExpandLess /> : <ExpandMore /> : null}
                    </ListItemButton>
                </ListItem>
                {boardsOpen && isDrawerOpen && (
                    <List component="div" disablePadding>
                        {Object.entries(groupedBoards).map(([collectionName, boardsInCollection]) => (
                            <React.Fragment key={collectionName}>
                                <ListItem disablePadding sx={{ pl: 4, pt: 1, pb: 0.5 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {collectionName}
                                    </Typography>
                                </ListItem>
                                {boardsInCollection.map((board) => (
                                    <React.Fragment key={board.id}>
                                        {board.data?.description ? (
                                            <Tooltip title={board.data.description} placement="right">
                                                <ListItemButton
                                                    sx={{ pl: 4 }}
                                                    onClick={() =>
                                                        handleItemClick(
                                                            board.id === VIRTUAL_ID_JOURNAL
                                                                ? '/journal'
                                                                : `/board/${board.id}`
                                                        )
                                                    }
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            minWidth: 0,
                                                            mr: isDrawerOpen ? 3 : 'auto',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '4px',
                                                                background:
                                                                    board.data?.gradientColors &&
                                                                    board.data.gradientColors.length >= 2
                                                                        ? `linear-gradient(45deg, ${board.data.gradientColors[0]}, ${board.data.gradientColors[1]})`
                                                                        : '#ccc',
                                                            }}
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <span>{board.name}</span>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color:
                                                                            board.taskCount === 0
                                                                                ? 'text.disabled'
                                                                                : 'text.secondary',
                                                                    }}
                                                                >
                                                                    {board.taskCount}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        sx={{
                                                            opacity: isDrawerOpen ? 1 : 0,
                                                            display: isDrawerOpen ? 'block' : 'none',
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </Tooltip>
                                        ) : (
                                            <ListItemButton
                                                sx={{ pl: 4 }}
                                                onClick={() =>
                                                    handleItemClick(
                                                        board.id === VIRTUAL_ID_JOURNAL
                                                            ? '/journal'
                                                            : `/board/${board.id}`
                                                    )
                                                }
                                            >
                                                <ListItemIcon
                                                    sx={{
                                                        minWidth: 0,
                                                        mr: isDrawerOpen ? 3 : 'auto',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '4px',
                                                            background:
                                                                board.data?.gradientColors &&
                                                                board.data.gradientColors.length >= 2
                                                                    ? `linear-gradient(45deg, ${board.data.gradientColors[0]}, ${board.data.gradientColors[1]})`
                                                                    : '#ccc',
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <span>{board.name}</span>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color:
                                                                        board.taskCount === 0
                                                                            ? 'text.disabled'
                                                                            : 'text.secondary',
                                                                }}
                                                            >
                                                                {board.taskCount}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{
                                                        opacity: isDrawerOpen ? 1 : 0,
                                                        display: isDrawerOpen ? 'block' : 'none',
                                                    }}
                                                />
                                            </ListItemButton>
                                        )}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </List>
            <Box sx={{ marginTop: 'auto' }}>
                <List>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => handleItemClick('/account')}
                            sx={{ minHeight: 48, justifyContent: isDrawerOpen ? 'initial' : 'center', px: 2.5 }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center' }}>
                                <TuneIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Settings"
                                sx={{ opacity: isDrawerOpen ? 1 : 0, display: isDrawerOpen ? 'block' : 'none' }}
                            />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={handleOpenUserMenu}
                            sx={{ minHeight: 48, justifyContent: isDrawerOpen ? 'initial' : 'center', px: 2.5 }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center' }}>
                                <Avatar
                                    sx={{ width: 24, height: 24 }}
                                    alt={user?.display_name || user?.username || 'User'}
                                    src={gravatarUrl}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={user?.display_name || user?.username || 'User'}
                                sx={{ opacity: isDrawerOpen ? 1 : 0, display: isDrawerOpen ? 'block' : 'none' }}
                            />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => handleItemClick('/about')}
                            sx={{ minHeight: 48, justifyContent: isDrawerOpen ? 'initial' : 'center', px: 2.5 }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center' }}>
                                <AdjustIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="About Yokan"
                                sx={{ opacity: isDrawerOpen ? 1 : 0, display: isDrawerOpen ? 'block' : 'none' }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
                <Menu
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                >
                    <MenuItem disabled>
                        <Typography textAlign="center">
                            User: {user?.username} ({user?.id})
                        </Typography>
                    </MenuItem>
                    <MenuItem disabled>
                        <Typography textAlign="center">Email: {user?.email}</Typography>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleCloseUserMenu();
                            logout(false);
                        }}
                    >
                        <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                </Menu>
            </Box>
        </>
    );

    return (
        <Box
            component="nav"
            sx={{
                width: open ? drawerWidth : collapsedWidth,
                flexShrink: 0,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <MuiDrawer
                variant="permanent"
                sx={{
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: isDrawerOpen ? drawerWidth : collapsedWidth,
                        overflowX: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    },
                }}
            >
                {drawerContent}
            </MuiDrawer>
        </Box>
    );
};

export default Sidebar;
