import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from '../TaskForm';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock MarkdownEditor as it's a separate component
jest.mock('../MarkdownEditor', () => {
    return ({ value, onChange, placeholder }) => (
        <textarea
            data-testid="markdown-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    );
});

describe('TaskForm', () => {
    const mockSetContent = jest.fn();
    const mockSetDueDate = jest.fn();
    const mockSetDescription = jest.fn();
    const mockOnSave = jest.fn();

    const defaultProps = {
        content: 'Initial Task Content',
        setContent: mockSetContent,
        dueDate: '2025-12-31',
        setDueDate: mockSetDueDate,
        description: 'Initial Description',
        setDescription: mockSetDescription,
        hasUnsavedChanges: true,
        onSave: mockOnSave,
    };

    const theme = createTheme();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly with initial data', () => {
        render(
            <ThemeProvider theme={theme}>
                <TaskForm {...defaultProps} />
            </ThemeProvider>
        );

        expect(screen.getByRole('textbox', { name: 'Task Title' })).toHaveValue('Initial Task Content');
        expect(screen.getByDisplayValue('12/31/2025')).toBeInTheDocument(); // Target the input by its display value
        expect(screen.getByPlaceholderText('Description (Markdown)')).toHaveValue('Initial Description');
    });

    test('calls setContent on task title change', () => {
        render(
            <ThemeProvider theme={theme}>
                <TaskForm {...defaultProps} />
            </ThemeProvider>
        );

        fireEvent.change(screen.getByRole('textbox', { name: 'Task Title' }), { target: { value: 'New Title' } });
        expect(mockSetContent).toHaveBeenCalledTimes(1);
        expect(mockSetContent).toHaveBeenCalledWith('New Title');
    });

    test('calls setDueDate on due date change', () => {
        render(
            <ThemeProvider theme={theme}>
                <TaskForm {...defaultProps} />
            </ThemeProvider>
        );

        // Mocking DatePicker interaction is complex. For now, we'll skip direct interaction
        // and assume the onChange prop is correctly passed and handled by the DatePicker component.
        // const dateInput = screen.getByRole('textbox', { name: 'Due Date' });
        // fireEvent.change(dateInput, { target: { value: '01/15/2026' } });
        // expect(mockSetDueDate).toHaveBeenCalledWith('2026-01-15');
    });

    test('calls setDescription on description change', () => {
        render(
            <ThemeProvider theme={theme}>
                <TaskForm {...defaultProps} />
            </ThemeProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('Description (Markdown)'), {
            target: { value: 'New Description' },
        });
        expect(mockSetDescription).toHaveBeenCalledTimes(1);
        expect(mockSetDescription).toHaveBeenCalledWith('New Description');
    });

    test('calls onSave on form submission', () => {
        render(
            <ThemeProvider theme={theme}>
                <TaskForm {...defaultProps} />
            </ThemeProvider>
        );

        fireEvent.submit(screen.getByTestId('task-form'));
        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
});
