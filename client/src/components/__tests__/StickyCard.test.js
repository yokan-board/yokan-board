import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import StickyCard from '../StickyCard';

// Mock marked
jest.mock('marked', () => {
    return {
        marked: {
            parse: (content) => `<p>${content}</p>`
        }
    };
});

describe('StickyCard', () => {
    const mockSticky = {
        id: 'sticky-1',
        title: 'Test Sticky',
        content: 'This is a test sticky content'
    };

    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const theme = createTheme();

    test('renders sticky title and content', async () => {
        render(
            <ThemeProvider theme={theme}>
                <StickyCard
                    sticky={mockSticky}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                    viewMode="list"
                />
            </ThemeProvider>
        );

        expect(screen.getByText('Test Sticky')).toBeInTheDocument();
        expect(screen.getByText('This is a test sticky content')).toBeInTheDocument();
    });
});
