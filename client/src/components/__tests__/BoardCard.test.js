import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BoardCard from '../BoardCard';

// Mock Material-UI's useTheme hook
jest.mock('@mui/material/styles', () => ({
    ...jest.requireActual('@mui/material/styles'),
    useTheme: jest.fn(() => ({
        palette: {
            mode: 'light',
            text: { primary: '#000000' },
            divider: '#e0e0e0',
            background: { paper: '#ffffff' },
        },
        spacing: (factor) => `${8 * factor}px`, // Mock the spacing function
        shadows: [
            'none',
            '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
            '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
        ],
    })),
}));

describe('BoardCard', () => {
    const mockBoard = {
        id: 'board-1',
        name: 'Test Board',
        data: {
            description: 'This is a test board',
            gradientColors: ['#FF0000', '#0000FF'],
        },
    };

    const mockOnEditClick = jest.fn();
    const mockOnDeleteClick = jest.fn();
    const mockOnCopyGradient = jest.fn();
    const mockOnPasteGradient = jest.fn();
    const mockOnChangeGradientClick = jest.fn();
    const mockOnLongPressChangeGradient = jest.fn();
    const mockOnNavigateToBoard = jest.fn(); // New mock for navigation

    const theme = createTheme();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers(); // Enable fake timers for long press
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers(); // Clear any pending timers
        });
        jest.useRealTimers(); // Restore real timers
    });

    test('renders board name and description', () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={null}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        expect(screen.getByText('Test Board')).toBeInTheDocument();
        expect(screen.getByText('This is a test board')).toBeInTheDocument();
    });

    test('calls onEditClick when edit button is clicked', async () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={null}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        fireEvent.click(screen.getByLabelText('edit board'));
        expect(mockOnEditClick).toHaveBeenCalledTimes(1);
        expect(mockOnEditClick).toHaveBeenCalledWith(mockBoard);
    });

    test('calls onDeleteClick when delete button is clicked', async () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={null}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        fireEvent.click(screen.getByLabelText('delete'));
        expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
        expect(mockOnDeleteClick).toHaveBeenCalledWith(mockBoard.id);
    });

    test('calls onCopyGradient when copy gradient button is clicked', async () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={null}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        fireEvent.click(screen.getByLabelText('copy gradient'));
        expect(mockOnCopyGradient).toHaveBeenCalledTimes(1);
        expect(mockOnCopyGradient).toHaveBeenCalledWith(mockBoard);
    });

    test('calls onPasteGradient when paste gradient button is clicked and copiedGradient exists', async () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={['#123456', '#654321']}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        fireEvent.click(screen.getByLabelText('paste gradient'));
        expect(mockOnPasteGradient).toHaveBeenCalledTimes(1);
        expect(mockOnPasteGradient).toHaveBeenCalledWith(mockBoard);
    });

    test('does not call onPasteGradient when paste gradient button is clicked and copiedGradient is null', async () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={null}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        expect(screen.getByLabelText('paste gradient')).toBeDisabled();
        fireEvent.click(screen.getByLabelText('paste gradient'));
        expect(mockOnPasteGradient).not.toHaveBeenCalled();
    });

    test('calls onChangeGradientClick on short press of palette icon', async () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={null}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        const paletteButton = screen.getByLabelText('change gradient');
        fireEvent.click(paletteButton);

        expect(mockOnChangeGradientClick).toHaveBeenCalledTimes(1);
        expect(mockOnChangeGradientClick).toHaveBeenCalledWith(mockBoard);
        expect(mockOnLongPressChangeGradient).not.toHaveBeenCalled();
    });

    test('calls onLongPressChangeGradient on long press of palette icon', async () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={null}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        const paletteButton = screen.getByLabelText('change gradient');
        fireEvent.mouseDown(paletteButton);
        jest.advanceTimersByTime(500);

        expect(mockOnLongPressChangeGradient).toHaveBeenCalledTimes(1);
        expect(mockOnLongPressChangeGradient).toHaveBeenCalledWith(mockBoard);
        expect(mockOnChangeGradientClick).not.toHaveBeenCalled();

        fireEvent.mouseUp(paletteButton);
    });

    test('calls onNavigateToBoard when board card content is clicked', async () => {
        render(
            <ThemeProvider theme={theme}>
                <BoardCard
                    board={mockBoard}
                    onEditClick={mockOnEditClick}
                    onDeleteClick={mockOnDeleteClick}
                    onCopyGradient={mockOnCopyGradient}
                    onPasteGradient={mockOnPasteGradient}
                    onChangeGradientClick={mockOnChangeGradientClick}
                    onLongPressChangeGradient={mockOnLongPressChangeGradient}
                    copiedGradient={null}
                    onNavigateToBoard={mockOnNavigateToBoard}
                />
            </ThemeProvider>
        );

        const boardCardContent = screen.getByTestId('board-card-content');
        fireEvent.click(boardCardContent);

        expect(mockOnNavigateToBoard).toHaveBeenCalledTimes(1);
        expect(mockOnNavigateToBoard).toHaveBeenCalledWith(mockBoard.id);
    });
});
