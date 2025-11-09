import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportBoardJsonDialog from '../ImportBoardJsonDialog';

describe('ImportBoardJsonDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnImport = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when open', () => {
        render(<ImportBoardJsonDialog open={true} onClose={mockOnClose} onImport={mockOnImport} />);

        expect(screen.getByText('Import Board from JSON')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Upload JSON File' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
    });

    test('calls onClose when Cancel button is clicked', () => {
        render(<ImportBoardJsonDialog open={true} onClose={mockOnClose} onImport={mockOnImport} />);

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('enables Import button and displays file selected message after file upload', async () => {
        render(<ImportBoardJsonDialog open={true} onClose={mockOnClose} onImport={mockOnImport} />);

        const file = new File([JSON.stringify({ name: 'Test Board' })], 'test.json', { type: 'application/json' });
        const input = screen.getByLabelText('Upload JSON File', { selector: 'input[type="file"]', exact: false });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('File selected.')).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: 'Import' })).not.toBeDisabled();
    });

    test('calls onImport with file content when Import button is clicked', async () => {
        render(<ImportBoardJsonDialog open={true} onClose={mockOnClose} onImport={mockOnImport} />);

        const fileContent = { name: 'Test Board', columns: {} };
        const file = new File([JSON.stringify(fileContent)], 'test.json', { type: 'application/json' });
        const input = screen.getByLabelText('Upload JSON File', { selector: 'input[type="file"]', exact: false });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Import' })).not.toBeDisabled();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Import' }));

        await waitFor(() => {
            expect(mockOnImport).toHaveBeenCalledTimes(1);
        });
        expect(mockOnImport).toHaveBeenCalledWith(fileContent);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
