import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateBoardDialog from '../CreateBoardDialog';

// Mock the createColumnsFromTemplate function
jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

jest.mock('../../services/templateService', () => ({
    createColumnsFromTemplate: jest.fn((template) => {
        if (template === 'Standard 3 columns') {
            return {
                'mock-uuid-1': { id: 'mock-uuid-1', title: 'To Do', tasks: [], highlightColor: '#000000' },
                'mock-uuid-2': { id: 'mock-uuid-2', title: 'In Progress', tasks: [], highlightColor: '#000000' },
                'mock-uuid-3': { id: 'mock-uuid-3', title: 'Done', tasks: [], highlightColor: '#000000' },
            };
        }
        return {};
    }),
}));

describe('CreateBoardDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnCreateBoard = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when open', () => {
        render(<CreateBoardDialog open={true} onClose={mockOnClose} onCreateBoard={mockOnCreateBoard} />);

        expect(screen.getByText('Create New Board')).toBeInTheDocument();
        expect(screen.getByLabelText('Board Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Template')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });

    test('calls onClose when Cancel button is clicked', () => {
        render(<CreateBoardDialog open={true} onClose={mockOnClose} onCreateBoard={mockOnCreateBoard} />);

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onCreateBoard with correct data when Create button is clicked', () => {
        render(<CreateBoardDialog open={true} onClose={mockOnClose} onCreateBoard={mockOnCreateBoard} />);

        const boardNameInput = screen.getByLabelText('Board Name');
        const descriptionInput = screen.getByLabelText('Description');
        const templateSelect = screen.getByLabelText('Template');
        const createButton = screen.getByRole('button', { name: 'Create' });

        fireEvent.change(boardNameInput, { target: { value: 'Test Board' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

        // Select a template
        fireEvent.mouseDown(templateSelect);
        fireEvent.click(screen.getByText('Standard 3 columns'));

        fireEvent.click(createButton);

        expect(mockOnCreateBoard).toHaveBeenCalledTimes(1);
        expect(mockOnCreateBoard).toHaveBeenCalledWith('Test Board', 'Test Description', {
            'mock-uuid-1': { id: 'mock-uuid-1', title: 'To Do', tasks: [], highlightColor: '#000000' },
            'mock-uuid-2': { id: 'mock-uuid-2', title: 'In Progress', tasks: [], highlightColor: '#000000' },
            'mock-uuid-3': { id: 'mock-uuid-3', title: 'Done', tasks: [], highlightColor: '#000000' },
        });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onCreateBoard if board name is empty', () => {
        render(<CreateBoardDialog open={true} onClose={mockOnClose} onCreateBoard={mockOnCreateBoard} />);

        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        expect(mockOnCreateBoard).not.toHaveBeenCalled();
    });
});
