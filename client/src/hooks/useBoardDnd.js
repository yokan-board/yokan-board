import { useState, useCallback } from 'react';
import { useSensor, useSensors, PointerSensor, KeyboardSensor, closestCorners } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const useBoardDnd = (boardData, updateBoardDataForColumnReorder, updateBoardDataForTaskMove) => {
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;

            setActiveId(null);

            if (!over) return;
            if (active.id === over.id) return;

            const activeType = active.data.current?.type;
            const overType = over.data.current?.type;

            // Dragging a Column
            if (activeType === 'Column') {
                // Dropping a column onto another column
                if (overType === 'Column') {
                    if (active.id !== over.id) {
                        updateBoardDataForColumnReorder(active.id, over.id);
                    }
                }
                // Dropping a column onto a task inside a column
                else if (overType === 'Task') {
                    const overColumnId = over.data.current?.columnId;
                    if (overColumnId && active.id !== overColumnId) {
                        updateBoardDataForColumnReorder(active.id, overColumnId);
                    }
                }
            }

            // Dragging a Task
            if (activeType === 'Task') {
                updateBoardDataForTaskMove(active.id, over.id);
            }
        },
        [updateBoardDataForColumnReorder, updateBoardDataForTaskMove]
    );

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
    }, []);

    return {
        activeId,
        sensors,
        collisionDetection: closestCorners,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragCancel: handleDragCancel,
    };
};
