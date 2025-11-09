import React from 'react';
import { render, screen } from '@testing-library/react';
import ParentTaskDisplay from '../ParentTaskDisplay';

describe('ParentTaskDisplay', () => {
    test('renders parent task information when parentTaskObject is provided', () => {
        const mockParentTask = {
            id: 'parent-1',
            content: 'Parent Task Content',
            displayId: 'PT-001',
        };

        render(<ParentTaskDisplay parentTaskObject={mockParentTask} />);

        expect(screen.getByLabelText('Parent Task')).toHaveValue('Parent Task Content (#PT-001)');
    });

    test("renders 'None' when parentTaskObject is null", () => {
        render(<ParentTaskDisplay parentTaskObject={null} />);

        expect(screen.getByLabelText('Parent Task')).toHaveValue('None');
    });

    test("renders 'None' when parentTaskObject is undefined", () => {
        render(<ParentTaskDisplay parentTaskObject={undefined} />);

        expect(screen.getByLabelText('Parent Task')).toHaveValue('None');
    });
});
