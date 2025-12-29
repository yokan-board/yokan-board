# CHANGES

## v0.1.0-alpha-7 (2025-12-29)

### Features

- **Administrative User Management**:
  - Full user record editing (username, display name, email, and enabled status).
  - Administrative password reset functionality for any user.
  - Enhanced User Management UI with interactive table rows and a dedicated edit dialog.
  - Intelligent save logic with real-time validation and password constraint checking.
  - Added "Reset Changes" option to the user record editor.
- **Centralized Contact Management**:
  - Implemented a unified contact management system with board-specific and global views.
  - Added shared contact editing dialog and standardized contact information displays.
  - Supported contact import (JSON/CSV) with conflict resolution strategies (merge, skip, replace).
  - Added bulk contact actions and export functionality.
  - Persistent sorting and grouping preferences in contact settings.
  - Drag-and-drop reordering for contacts in Board Notes.
  - Integrated contacts into Markdown and CSV board exports.
- **Task Comments & History**:
  - Full task commenting system with comment counts displayed on task cards.
  - Automatic historical log appended to task comments when moving tasks between columns.
  - Comments included in Markdown and CSV exports and displayed in archived tasks.
- **Dashboard & Board UI**:
  - Persistent board reordering on the dashboard with multi-container drag-and-drop support.
  - Standardized semantic color usage, button variants, and form spacing across all components.
  - Refined global theme with standardized typography and an improved dark mode palette.
  - Enhanced task and column cards with better metadata layouts and action icons on hover.
  - Added collection name to breadcrumbs on the Edit Task page.
- **API & Documentation**:
  - Completed OpenAPI 1.1 specification covering all new v1.1 endpoints.
  - Added board organization attributes (short name, full name, logo, and URL).
  - Improved inactivity timeout tracking with cross-tab synchronization.

### Fixes & Improvements

- **Code Quality & Stability**:
  - Project-wide linting and formatting pass on the server codebase using Prettier.
  - Extensive cleanup of unused variables, imports, and dead code.
  - Updated server test suite to align with current database schema and logic.
  - Added `py3-setuptools` to server Dockerfile to resolve Python 3.12 build issues.
- **UI/UX Refinements**:
  - Implemented responsive 2-column layouts for contact lists.
  - Standardized phone number formatting to '+1 (XXX) XXX-XXXX'.
  - Added copy-to-clipboard actions for contact information.
  - Fixed sidebar visibility issues on logout and removed redundant context providers.

## v0.1.1-alpha-3 (Pre-release)

### Features

- **Import Board Collection Assignment**: When importing a board from a JSON file, users can now assign it to an existing collection or create a new one, with "Imported Boards" as the default.
- **Board Page Collection Display**: The collection name for the current board is now displayed above the board's name on the Board Page, using a smaller font size. If no collection is assigned, "Boards" is displayed as the default.
- **Sidebar Board Grouping by Collection**: The sidebar now groups boards by their assigned collections, using collection names as separators. These separators are styled with a smaller, dimmer font. Boards without an explicit collection are grouped under a default "Boards" heading.

## v0.1.1-alpha-2 (Pre-release)

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

## v0.1.1-alpha-1 (Pre-release)

- **Initial Release**: Yokan Board initial release with very basic functionalities.