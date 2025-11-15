import React from 'react';
import { Box } from '@mui/material';
import BoardCard from './BoardCard';

function BoardList({
    boards,
    onEdit,
    onDelete,
    onCopyGradient,
    onPasteGradient,
    onChangeGradient,
    onLongPressChangeGradient,
    copiedGradient,
    onNavigateToBoard,
}) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {boards.map((board) => (
                <BoardCard
                    key={board.id}
                    board={board}
                    onEditClick={onEdit}
                    onDeleteClick={onDelete}
                    onCopyGradient={onCopyGradient}
                    onPasteGradient={onPasteGradient}
                    onChangeGradientClick={onChangeGradient}
                    onLongPressChangeGradient={onLongPressChangeGradient}
                    copiedGradient={copiedGradient}
                    onNavigateToBoard={onNavigateToBoard}
                />
            ))}
        </Box>
    );
}

export default BoardList;
