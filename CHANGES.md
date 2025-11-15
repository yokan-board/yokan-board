# CHANGES

## v0.1.1 (Unreleased)

### Features

- **Task and Column Archival**: Implemented the ability to archive individual tasks or entire columns. Archived tasks are moved to a dedicated "ARCHIVE" tab, preserving their original column's highlight color, while archived columns remain on the board with their tasks removed.
- **User Preference: Hide Unnamed Collection Heading Label**: Added a user preference to hide the "Boards" section heading on the dashboard when no collection is assigned, reducing visual clutter.
- **Board Collections**: Implemented the ability to group Kanban boards into named collections for better organization.
  - Server-side: Added `collection` column to boards, updated API for CRUD operations, and added server-side validation.
  - Client-side: Added "Collection" comboboxes to board creation/editing forms, and grouped boards by collection on the dashboard.
- **Markdown Export**: Added the ability to export Kanban boards to a well-structured Markdown file, including board name, description, columns, tasks, due dates, descriptions, and subtasks.
- **Task Card UI Improvements**: Enhanced task cards on the board to display action icons only on hover, reducing visual clutter and providing a smoother user experience with animated transitions.
- **CORS Configuration Externalization**: Moved `ALLOWED_ORIGINS` configuration to `server/.env` for dynamic and flexible CORS management.

### Fixes

- Corrected client-side `AuthContext` import errors in various components.
- Ensured proper persistence of board `collection` data during creation and updates.
- Refined dashboard display of board collections, including alphabetical sorting and improved heading presentation.

### Documentation

- Updated `README.md` to reflect new features, `ALLOWED_ORIGINS` environment variable, and `jszip` dependency.
