import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import boardService from '../services/boardService';
import { generateRandomGradientColors } from '../services/colorService';
import { useAuth } from './AuthContext';

const BoardContext = createContext({
    boards: [],
    fetchBoards: () => {},
});

export const useBoards = () => useContext(BoardContext);

export function BoardProvider({ children }) {
    const [boards, setBoards] = useState([]);
    const { user } = useAuth();

    const fetchBoards = useCallback(async () => {
        if (!user) return;
        try {
            const fetchedBoards = await boardService.getBoards(user.id);
            const updatedBoards = await Promise.all(
                fetchedBoards.map(async (board) => {
                    let taskCount = 0;
                    if (board.data && board.data.columns) {
                        taskCount = Object.values(board.data.columns).reduce(
                            (acc, column) => acc + (column.tasks ? column.tasks.length : 0),
                            0
                        );
                    }
                    board.taskCount = taskCount;

                    if (!board.data.gradientColors || board.data.gradientColors.length === 0) {
                        const newGradientColors = generateRandomGradientColors();
                        const updatedBoard = { ...board, data: { ...board.data, gradientColors: newGradientColors } };
                        await boardService.updateBoard(board.id, board.name, updatedBoard.data);
                        return updatedBoard;
                    }
                    return board;
                })
            );
            setBoards(updatedBoards);
        } catch (error) {
            console.error('Error fetching boards:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchBoards();
        }
    }, [user, fetchBoards]);

    const value = {
        boards,
        fetchBoards,
    };

    return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}
