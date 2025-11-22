# CHANGES

## v0.1.1 (Unreleased)

### Features

- **Admin User Management**: Enhanced administrative capabilities allow toggling user 'enabled' status (except for the main admin), with conditional display of the 'ADMIN' tab based on user role. The 'Users' table now includes Gravatar icons and usernames for better identification.
- **Parent Task Update on Archival**: When a subtask is archived, its details are now appended to its parent task's description, creating a historical log. This is in addition to the task being added to the main archive.
- **Enhanced Exports**: Markdown, JSON, and CSV exports have been updated to include archived tasks, providing a more complete data export.
- **Task and Column Archival**: Implemented the ability to archive individual tasks or entire columns. Archived tasks are moved to a dedicated "ARCHIVE" tab, preserving their original column's highlight color, while archived columns remain on the board with their tasks removed.
- **User Preference: Hide Unnamed Collection Heading Label**: Added a user preference to hide the "Boards" section heading on the dashboard when no collection is assigned, reducing visual clutter.
- **Board Collections**: Implemented the ability to group Kanban boards into named collections for better organization.
  - Server-side: Added `collection` column to boards, updated API for CRUD operations, and added server-side validation.
  - Client-side: Added "Collection" comboboxes to board creation/editing forms, and grouped boards by collection on the dashboard.
- **Markdown Export**: Added the ability to export Kanban boards to a well-structured Markdown file, including board name, description, columns, tasks, due dates, descriptions, and subtasks.
- **Task Card UI Improvements**: Enhanced task cards on the board to display action icons only on hover, reducing visual clutter and providing a smoother user experience with animated transitions.
- **CORS Configuration Externalization**: Moved `ALLOWED_ORIGINS` configuration to `server/.env` for dynamic and flexible CORS management.

### Fixes

- **Archive Tab Stability**: Corrected issues where the "Archive" tab content would disappear when refreshing the board or re-selecting the current board from the sidebar.
- **Board Creation**: Addressed a bug that occurred during the creation of new boards.
- **Archived Task UI**: Improved the user interface for displaying archived tasks for better clarity and consistency.
- **AuthContext Imports**: Corrected client-side `AuthContext` import errors in various components.
- **Collection Data Persistence**: Ensured proper persistence of board `collection` data during creation and updates.
- **Dashboard Collection Display**: Refined dashboard display of board collections, including alphabetical sorting and improved heading presentation.

### Documentation

- Updated `openapi.yaml` to include new user administration endpoints and schemas.
- Updated `README.md` to reflect new features, `ALLOWED_ORIGINS` environment variable, and `jszip` dependency.
