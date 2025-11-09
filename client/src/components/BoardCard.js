import React, { useRef } from 'react';
import { Box, ListItem, ListItemText, Paper, IconButton, Typography } from '@mui/material';
import {
    Delete as DeleteIcon,
    Palette as PaletteIcon,
    Edit as EditIcon,
    ContentCopy,
    ContentPaste,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

function BoardCard({
    board,
    onEditClick,
    onDeleteClick,
    onCopyGradient,
    onPasteGradient,
    onChangeGradientClick,
    onLongPressChangeGradient,
    copiedGradient,
}) {
    const theme = useTheme();
    const navigate = useNavigate();
    const longPressTimer = useRef(null);

    const handleLongPressEnd = () => {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    };

    const hasGradient = board.data.gradientColors && board.data.gradientColors.length === 2;
    const textColor = hasGradient ? '#fff' : theme.palette.text.primary;
    const secondaryTextColor = hasGradient ? 'rgba(255, 255, 255, 0.8)' : theme.palette.text.secondary;
    const iconColor = hasGradient ? 'rgba(255, 255, 255, 0.7)' : '#9e9e9e';
    const iconHoverColor = hasGradient ? '#fff' : theme.palette.text.primary;

    return (
        <ListItem
            key={board.id}
            component={Paper}
            sx={{
                width: '24rem',
                height: '14.8rem',
                flexShrink: 0,
                backgroundColor: hasGradient
                    ? 'transparent'
                    : theme.palette.mode === 'light'
                      ? '#f5f5f5'
                      : theme.palette.background.paper,
                backgroundImage: hasGradient
                    ? `linear-gradient(45deg, ${board.data.gradientColors[0]}, ${board.data.gradientColors[1]})`
                    : 'none',
                borderRadius: '8px',
                border: theme.palette.mode === 'light' ? `1px solid ${theme.palette.divider}` : 'none',
                boxShadow: theme.shadows[1],
                '&:hover': {
                    boxShadow: theme.shadows[3],
                },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing(2),
                color: textColor, // Set the default text color for the card
            }}
        >
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                <IconButton
                    aria-label="copy gradient"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCopyGradient(board);
                    }}
                    size="small"
                    sx={{
                        color: iconColor,
                        '&:hover': {
                            color: iconHoverColor,
                        },
                    }}
                >
                    <ContentCopy fontSize="small" />
                </IconButton>
                <IconButton
                    aria-label="paste gradient"
                    disabled={!copiedGradient}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPasteGradient(board);
                    }}
                    size="small"
                    sx={{
                        color: copiedGradient ? iconColor : '#e0e0e0',
                        '&:hover': {
                            color: copiedGradient ? iconHoverColor : '#e0e0e0',
                        },
                    }}
                >
                    <ContentPaste fontSize="small" />
                </IconButton>
                <IconButton
                    aria-label="edit board"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(board);
                    }}
                    size="small"
                    sx={{
                        color: iconColor,
                        '&:hover': {
                            color: iconHoverColor,
                        },
                    }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                    aria-label="change gradient"
                    onMouseDown={() => {
                        longPressTimer.current = setTimeout(() => {
                            onChangeGradientClick(board); // Long click: Set random gradient
                            longPressTimer.current = null;
                        }, 500);
                    }}
                    onMouseUp={() => {
                        if (longPressTimer.current) {
                            // If timer is still running, it's a short click
                            clearTimeout(longPressTimer.current);
                            longPressTimer.current = null;
                            onLongPressChangeGradient(board); // Short click: Open dialog
                        }
                    }}
                    onMouseLeave={handleLongPressEnd} // Clear timer if mouse leaves before up
                    size="small"
                    sx={{
                        color: iconColor,
                        '&:hover': {
                            color: iconHoverColor,
                        },
                    }}
                >
                    <PaletteIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box
                data-testid="board-card-content"
                onClick={() => navigate(`/board/${board.id}`)}
                sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    flexGrow: 1,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
            >
                <ListItemText
                    primary={board.name}
                    primaryTypographyProps={{
                        fontSize: '1.4rem',
                        fontWeight: 'medium',
                        textAlign: 'center',
                        color: textColor,
                    }}
                    secondary={board.data.description}
                    secondaryTypographyProps={{
                        fontSize: '1.0rem',
                        noWrap: false,
                        component: 'div',
                        textAlign: 'center',
                        color: secondaryTextColor,
                    }}
                    sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                />
            </Box>

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 'medium', color: secondaryTextColor }}>
                    {board.taskCount} {board.taskCount === 1 ? 'Task' : 'Tasks'}
                </Typography>
                <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onDeleteClick(board.id)}
                    sx={{
                        color: iconColor,
                        '&:hover': {
                            color: iconHoverColor,
                        },
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        </ListItem>
    );
}

export default BoardCard;
