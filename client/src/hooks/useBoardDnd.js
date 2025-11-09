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

            if (!over) return;

            if (active.id === over.id) return;

            const activeIsColumn = active.id in boardData.columns;
            const overIsColumn = over.id in boardData.columns;

            if (activeIsColumn && overIsColumn) {
                updateBoardDataForColumnReorder(active.id, over.id);
            } else {
                updateBoardDataForTaskMove(active.id, over.id);
            }
            setActiveId(null);
        },
        [boardData.columns, updateBoardDataForColumnReorder, updateBoardDataForTaskMove]
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
