import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';

describe('DeleteConfirmationDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when open', () => {
        render(<DeleteConfirmationDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

        expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
        expect(
            screen.getByText('Are you sure you want to delete this board? This action is not reversible.')
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    test('calls onClose when Cancel button is clicked', () => {
        render(<DeleteConfirmationDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onConfirm when Delete button is clicked', () => {
        render(<DeleteConfirmationDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
});
