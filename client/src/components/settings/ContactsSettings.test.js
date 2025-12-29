import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactsSettings from './ContactsSettings';
import contactService from '../../services/contactService';

// Mock dependencies
jest.mock('../../services/contactService', () => ({
    getContacts: jest.fn(),
    createContact: jest.fn(),
    updateContact: jest.fn(),
    deleteContact: jest.fn(),
}));
jest.mock('../ContactEditDialog', () => () => <div data-testid="contact-edit-dialog">ContactEditDialog</div>);
jest.mock('../ContactCard', () => ({ contact }) => (
    <div data-testid="contact-card">{contact.name} - {contact.company}</div>
));

describe('ContactsSettings Sorting', () => {
    const mockContacts = [
        { id: 1, name: 'Alice Smith', company: 'Acme Corp', title: 'Developer', email: 'alice@example.com' },
        { id: 2, name: 'Bob Jones', company: 'Beta Inc', title: 'Manager', email: 'bob@example.com' },
        { id: 3, name: 'Charlie Brown', company: 'Acme Corp', title: 'Designer', email: 'charlie@example.com' },
        { id: 4, name: 'David Lee', company: 'Gamma LLC', title: 'Analyst', email: 'david@example.com' }
    ];

    beforeEach(() => {
        contactService.getContacts.mockResolvedValue(mockContacts);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders contacts sorted by Name by default', async () => {
        render(<ContactsSettings />);
        
        await waitFor(() => {
            const cards = screen.getAllByTestId('contact-card');
            expect(cards).toHaveLength(4);
            expect(cards[0]).toHaveTextContent('Alice Smith');
            expect(cards[1]).toHaveTextContent('Bob Jones');
            expect(cards[2]).toHaveTextContent('Charlie Brown');
            expect(cards[3]).toHaveTextContent('David Lee');
        });

        // Check headers (First letters)
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.getByText('C')).toBeInTheDocument();
        expect(screen.getByText('D')).toBeInTheDocument();
    });

    test('sorts by Company', async () => {
        render(<ContactsSettings />);
        
        await waitFor(() => screen.getAllByTestId('contact-card'));

        const sortSelect = screen.getByLabelText('Sort By');
        fireEvent.mouseDown(sortSelect);
        const companyOption = screen.getByText('Company');
        fireEvent.click(companyOption);

        await waitFor(() => {
            const cards = screen.getAllByTestId('contact-card');
            expect(cards).toHaveLength(4);
            // Acme Corp should come first (Alice or Charlie)
            // Then Beta Inc (Bob)
            // Then Gamma LLC (David)
        });

        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('Beta Inc')).toBeInTheDocument();
        expect(screen.getByText('Gamma LLC')).toBeInTheDocument();
    });

    test('sorts by Last Name', async () => {
        render(<ContactsSettings />);
        
        await waitFor(() => screen.getAllByTestId('contact-card'));

        const sortSelect = screen.getByLabelText('Sort By');
        fireEvent.mouseDown(sortSelect);
        const lastNameOption = screen.getByText('Last Name');
        fireEvent.click(lastNameOption);

        await waitFor(() => {
            const cards = screen.getAllByTestId('contact-card');
            // Expected Order: Brown (Charlie), Jones (Bob), Lee (David), Smith (Alice)
            expect(cards[0]).toHaveTextContent('Brown, Charlie');
            expect(cards[1]).toHaveTextContent('Jones, Bob');
            expect(cards[2]).toHaveTextContent('Lee, David');
            expect(cards[3]).toHaveTextContent('Smith, Alice');
        });

        // Check headers
        expect(screen.getByText('B')).toBeInTheDocument(); // Brown
        expect(screen.getByText('J')).toBeInTheDocument(); // Jones
        expect(screen.getByText('L')).toBeInTheDocument(); // Lee
        expect(screen.getByText('S')).toBeInTheDocument(); // Smith
    });

    test('sorts by Title', async () => {
        render(<ContactsSettings />);
        
        await waitFor(() => screen.getAllByTestId('contact-card'));

        const sortSelect = screen.getByLabelText('Sort By');
        fireEvent.mouseDown(sortSelect);
        const titleOption = screen.getByText('Title');
        fireEvent.click(titleOption);

        await waitFor(() => {
            const cards = screen.getAllByTestId('contact-card');
            // Expected Order: Analyst (David), Designer (Charlie), Developer (Alice), Manager (Bob)
            expect(cards[0]).toHaveTextContent('David Lee'); // Analyst
            expect(cards[1]).toHaveTextContent('Charlie Brown'); // Designer
            expect(cards[2]).toHaveTextContent('Alice Smith'); // Developer
            expect(cards[3]).toHaveTextContent('Bob Jones'); // Manager
        });
        
         // Check headers
        expect(screen.getByText('A')).toBeInTheDocument(); // Analyst
        expect(screen.getByText('D')).toBeInTheDocument(); // Designer, Developer
        expect(screen.getByText('M')).toBeInTheDocument(); // Manager
    });

    test('remembers sorting preference from localStorage', async () => {
        localStorage.setItem('contactsSortBy', 'company');
        render(<ContactsSettings />);
        
        await waitFor(() => {
            // Check that Acme Corp header exists
            const headers = screen.getAllByText('Acme Corp');
            expect(headers.length).toBeGreaterThan(0);
            
            // Check the select component display text
            const selectDisplay = screen.getByRole('combobox');
            expect(selectDisplay).toHaveTextContent('Company');
        });
        localStorage.clear();
    });
});
