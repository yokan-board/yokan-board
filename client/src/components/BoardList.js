import React from 'react';
import { Box } from '@mui/material';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
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
}) {
    return (
        <SortableContext items={boards.map((b) => b.id)} strategy={rectSortingStrategy}>
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
                    />
                ))}
            </Box>
        </SortableContext>
    );
}

export default BoardList;
