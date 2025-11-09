import React, { useImperativeHandle, forwardRef } from 'react';
import { Box } from '@mui/material';
import Column from './Column';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import DragOverlayTask from './DragOverlayTask';

import EmptyBoardMessage from './EmptyBoardMessage';
import { useBoardData } from '../hooks/useBoardData';
import { useBoardDnd } from '../hooks/useBoardDnd';

const Board = forwardRef(({ initialBoardData, boardName, boardId, onSaveBoard }, ref) => {
    const {
        boardData,
        tasksMap,
        getParentDisplayId,
        handleUpdateColumn,
        handleAddTask,
        handleDeleteTask,
        handleDeleteColumn,
        handleCreateFromTemplate,
        updateBoardDataForColumnReorder,
        updateBoardDataForTaskMove,
    } = useBoardData(initialBoardData, boardName, boardId, onSaveBoard);

    const { activeId, sensors, collisionDetection, onDragStart, onDragEnd, onDragCancel } = useBoardDnd(
        boardData,
        updateBoardDataForColumnReorder,
        updateBoardDataForTaskMove
    );

    useImperativeHandle(ref, () => ({
        getBoardData: () => boardData,
    }));

    const activeTask = activeId ? tasksMap[activeId] : null;
    const hasColumns = Object.keys(boardData.columns).length > 0;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
        >
            {hasColumns ? (
                <Box
                    sx={{
                        display: 'flex',
                        overflowX: 'auto',
                        px: 0,
                        py: 2,
                        alignItems: 'flex-start',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <SortableContext items={boardData.columnOrder} strategy={horizontalListSortingStrategy}>
                        {boardData.columnOrder.map((columnId, index) => {
                            const column = boardData.columns[columnId];
                            return (
                                column && (
                                    <Column
                                        key={column.id}
                                        column={column}
                                        boardId={boardId}
                                        getParentDisplayId={getParentDisplayId}
                                        onAddTask={handleAddTask}
                                        onDeleteTask={handleDeleteTask}
                                        onDeleteColumn={handleDeleteColumn}
                                        onUpdateColumn={handleUpdateColumn}
                                        tasksMap={tasksMap}
                                        isFirst={index === 0}
                                    />
                                )
                            );
                        })}
                    </SortableContext>
                </Box>
            ) : (
                <EmptyBoardMessage onCreateFromTemplate={handleCreateFromTemplate} />
            )}

            <DragOverlay>{activeTask ? <DragOverlayTask task={activeTask} tasksMap={tasksMap} /> : null}</DragOverlay>
        </DndContext>
    );
});

export default Board;
