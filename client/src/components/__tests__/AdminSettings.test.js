import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AdminSettings from '../settings/AdminSettings';

describe('AdminSettings', () => {
    const theme = createTheme();

    test('does not render "Admin Settings" text', () => {
        render(
            <ThemeProvider theme={theme}>
                <AdminSettings />
            </ThemeProvider>
        );

        expect(screen.queryByText('Admin Settings')).not.toBeInTheDocument();
    });

    test('does not render "Admin features will be added here in the future." text', () => {
        render(
            <ThemeProvider theme={theme}>
                <AdminSettings />
            </ThemeProvider>
        );

        expect(screen.queryByText('Admin features will be added here in the future.')).not.toBeInTheDocument();
    });
});
