import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ColorPickerDialog from '../ColorPickerDialog';

// Mock Material-UI's useTheme hook
jest.mock('@mui/material/styles', () => ({
    ...jest.requireActual('@mui/material/styles'),
    useTheme: jest.fn(() => ({
        palette: {
            primary: { main: '#1976d2' },
            mode: 'light',
            divider: '#e0e0e0',
            background: { paper: '#ffffff' },
        },
        shadows: [
            'none',
            '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
            '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
        ],
    })),
}));

// Mock colorUtils
jest.mock('../../utils/colorUtils', () => ({
    ...jest.requireActual('../../utils/colorUtils'), // Use actual implementation for other functions
    generateRandomGradientColors: jest.fn(() => ['#R1G1B1', '#R2G2B2']),
    rgbToHex: jest.fn(
        (r, g, b) =>
            `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    ),
    hexToRgb: jest.fn((hex) => {
        if (hex === '#R1G1B1') return { r: 225, g: 225, b: 225 };
        if (hex === '#R2G2B2') return { r: 226, g: 226, b: 226 };
        return { r: 255, g: 255, b: 255 };
    }),
    parseGradientString: jest.fn((str) => {
        if (str === 'linear-gradient(45deg, #R1G1B1, #R2G2B2)') return ['#R1G1B1', '#R2G2B2'];
        return null;
    }),
}));

describe('ColorPickerDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();
    const mockBoard = {
        id: 'board-1',
        name: 'Test Board',
        data: { gradientColors: ['#AABBCC', '#DDEEFF'] },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when open with board data', () => {
        render(<ColorPickerDialog open={true} onClose={mockOnClose} board={mockBoard} onSave={mockOnSave} />);

        expect(screen.getByText('Select Background Color')).toBeInTheDocument();
        expect(screen.getByText('Red')).toBeInTheDocument();
        expect(screen.getByText('Green')).toBeInTheDocument();
        expect(screen.getByText('Blue')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    test('calls onSave with new gradient colors when Save button is clicked', async () => {
        render(<ColorPickerDialog open={true} onClose={mockOnClose} board={mockBoard} onSave={mockOnSave} />);

        // Simulate changing colors (e.g., red slider for start color)
        const redSlider = screen.getAllByRole('slider', { name: 'Red' })[0]; // Assuming first is start color
        fireEvent.change(redSlider, { target: { value: 100 } });

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledTimes(1);
        });
        expect(mockOnSave).toHaveBeenCalledWith(
            mockBoard.id,
            expect.arrayContaining([expect.any(String), expect.any(String)])
        );
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('handles random color picking', async () => {
        render(<ColorPickerDialog open={true} onClose={mockOnClose} board={mockBoard} onSave={mockOnSave} />);

        fireEvent.click(screen.getByRole('button', { name: 'Pick Random' }));

        // Expect the input string to reflect the random colors from the mock
        await waitFor(() => {
            expect(screen.getByLabelText('Paste linear-gradient code')).toHaveValue(
                'linear-gradient(45deg, #R1G1B1, #R2G2B2)'
            );
        });
    });

    test('handles gradient string input', async () => {
        render(<ColorPickerDialog open={true} onClose={mockOnClose} board={mockBoard} onSave={mockOnSave} />);

        const gradientInput = screen.getByLabelText('Paste linear-gradient code');
        fireEvent.change(gradientInput, { target: { value: 'linear-gradient(45deg, #R1G1B1, #R2G2B2)' } });

        await waitFor(() => {
            // Expect the color boxes to update based on the parsed string
            const startColorBox = screen.getByTestId('start-color-box');
            expect(startColorBox).toHaveStyle('background-color: rgb(225, 225, 225)');
        });
    });
});
