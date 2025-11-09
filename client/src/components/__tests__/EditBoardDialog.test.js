import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditBoardDialog from '../EditBoardDialog';

describe('EditBoardDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();
    const mockBoard = {
        id: 'board-1',
        name: 'Test Board',
        data: { description: 'Initial Description' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when open with board data', () => {
        render(<EditBoardDialog open={true} onClose={mockOnClose} board={mockBoard} onSave={mockOnSave} />);

        expect(screen.getByText('Edit Board')).toBeInTheDocument();
        expect(screen.getByLabelText('Board Name')).toHaveValue('Test Board');
        expect(screen.getByLabelText('Description')).toHaveValue('Initial Description');
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    test('calls onClose when Cancel button is clicked', () => {
        render(<EditBoardDialog open={true} onClose={mockOnClose} board={mockBoard} onSave={mockOnSave} />);

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onSave with updated data when Save button is clicked', async () => {
        render(<EditBoardDialog open={true} onClose={mockOnClose} board={mockBoard} onSave={mockOnSave} />);

        const boardNameInput = screen.getByLabelText('Board Name');
        const descriptionInput = screen.getByLabelText('Description');
        const saveButton = screen.getByRole('button', { name: 'Save' });

        fireEvent.change(boardNameInput, { target: { value: 'Updated Board Name' } });
        fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledTimes(1);
        });
        expect(mockOnSave).toHaveBeenCalledWith('board-1', 'Updated Board Name', 'Updated Description');
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('updates state when board prop changes', () => {
        const { rerender } = render(
            <EditBoardDialog open={true} onClose={mockOnClose} board={mockBoard} onSave={mockOnSave} />
        );

        expect(screen.getByLabelText('Board Name')).toHaveValue('Test Board');
        expect(screen.getByLabelText('Description')).toHaveValue('Initial Description');

        const newBoard = {
            id: 'board-2',
            name: 'New Board Name',
            data: { description: 'New Description' },
        };

        rerender(<EditBoardDialog open={true} onClose={mockOnClose} board={newBoard} onSave={mockOnSave} />);

        expect(screen.getByLabelText('Board Name')).toHaveValue('New Board Name');
        expect(screen.getByLabelText('Description')).toHaveValue('New Description');
    });
});
