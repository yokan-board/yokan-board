import React, { useRef } from 'react';
import { Box, ListItem, ListItemText, Paper, IconButton, Typography } from '@mui/material';
import {
    Delete as DeleteIcon,
    Palette as PaletteIcon,
    Edit as EditIcon,
    ContentCopy,
    ContentPaste,
    DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VIRTUAL_ID_JOURNAL } from '../utils/constants';

function BoardCard({
    board,
    onEditClick,
    onDeleteClick,
    onCopyGradient,
    onPasteGradient,
    onChangeGradientClick,
    onLongPressChangeGradient,
    copiedGradient,
    isOverlay = false,
}) {
    const theme = useTheme();
    const navigate = useNavigate();
    const longPressTimer = useRef(null);

    const isJournal = board.id === VIRTUAL_ID_JOURNAL;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: board.id,
        disabled: isOverlay || isJournal, // Disable sortable logic for the overlay component itself or Journal
        data: {
            type: 'Board',
            board,
        },
    });

    const style = {
        transform: isOverlay ? undefined : CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    const handleLongPressEnd = () => {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    };

    const hasGradient = board.data.gradientColors && board.data.gradientColors.length === 2;
    const textColor = hasGradient ? '#fff' : theme.palette.text.primary;
    const secondaryTextColor = hasGradient ? 'rgba(255, 255, 255, 0.8)' : theme.palette.text.secondary;
    const iconColor = hasGradient ? 'rgba(255, 255, 255, 0.7)' : '#9e9e9e';
    const iconHoverColor = hasGradient ? '#fff' : theme.palette.text.primary;

    const org = board.data.org;

    // Fixed overlay style to prevent scaling glitches
    const overlayStyle = {
        opacity: 0.9,
        boxShadow: theme.shadows[10],
        cursor: 'grabbing',
        transform: 'scale(1.02)', // Minimal scale for feedback
    };

    return (
        <ListItem
            ref={setNodeRef}
            style={isOverlay ? overlayStyle : style}
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
                    '& .drag-handle': {
                        opacity: isJournal ? 0 : 1,
                    },
                },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing(2),
                color: textColor,
                position: 'relative',
                cursor: isJournal ? 'pointer' : 'default',
            }}
            {...attributes}
        >
            {!isOverlay && !isJournal && (
                <IconButton
                    className="drag-handle"
                    size="small"
                    {...listeners}
                    sx={{
                        position: 'absolute',
                        top: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        color: iconColor,
                        cursor: 'grab',
                        '&:active': {
                            cursor: 'grabbing',
                        },
                    }}
                >
                    <DragHandleIcon fontSize="small" />
                </IconButton>
            )}
            {org && (
                <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                    {org.logo ? (
                        <Box
                            sx={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '8px',
                                backgroundColor: theme.palette.background.paper,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <img
                                src={org.logo}
                                alt={org.short_name || 'Organization Logo'}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                            />
                        </Box>
                    ) : (
                        org.short_name && (
                            <Typography variant="h6" sx={{ color: textColor, fontWeight: 'bold' }}>
                                {org.short_name}
                            </Typography>
                        )
                    )}
                </Box>
            )}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '4px', minHeight: '34px' }}>
                {!isJournal && (
                    <>
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
                                    onChangeGradientClick(board);
                                    longPressTimer.current = null;
                                }, 500);
                            }}
                            onMouseUp={() => {
                                if (longPressTimer.current) {
                                    clearTimeout(longPressTimer.current);
                                    longPressTimer.current = null;
                                    onLongPressChangeGradient(board);
                                }
                            }}
                            onMouseLeave={handleLongPressEnd}
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
                    </>
                )}
            </Box>

            <Box
                data-testid="board-card-content"
                onClick={() => !isOverlay && navigate(isJournal ? '/journal' : `/board/${board.id}`)}
                sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    flexGrow: 1,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: isOverlay ? 'grabbing' : 'pointer',
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

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '34px',
                }}
            >
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 'medium', color: secondaryTextColor }}>
                    {board.taskCount} {board.taskCount === 1 ? 'Task' : 'Tasks'}
                </Typography>
                {!isJournal && (
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => !isOverlay && onDeleteClick(board.id)}
                        sx={{
                            color: iconColor,
                            '&:hover': {
                                color: iconHoverColor,
                            },
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>
        </ListItem>
    );
}

export default BoardCard;
