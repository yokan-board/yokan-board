# Yokan Board Technical Overview

This document provides a technical deep-dive into the Yokan Board codebase to assist developers in understanding the architecture, data flow, and key patterns used in the project.

## 1. Project Structure

The project is a monorepo containing both the client and server applications.

```
/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Board, Column, Task)
│   │   ├── contexts/       # Global state (Auth, Theme, Board List)
│   │   ├── hooks/          # Complex logic (useBoardData, useBoardDnd)
│   │   ├── pages/          # Route views (DashboardPage, BoardPage)
│   │   ├── services/       # API wrappers (axios)
│   │   ├── theme/          # MUI theme definitions
│   │   └── utils/          # Helper functions
│   └── package.json
├── server/                 # Express Backend
│   ├── controllers/        # Request handlers (Business Logic)
│   ├── middleware/         # Auth & Error handling
│   ├── models/             # Database access (SQL + JSON parsing)
│   ├── routes/             # API Endpoint definitions
│   ├── database.js         # SQLite connection & Schema initialization
│   └── package.json
└── docs/                   # Documentation
```

## 2. Database Schema (SQLite)

The application uses **SQLite** for simplicity and portability. The schema is defined and initialized in `server/database.js`.

### Key Tables

#### `users`
Stores user credentials and preferences.
*   `id`: INTEGER PK
*   `username`: TEXT UNIQUE
*   `email`: TEXT UNIQUE
*   `display_name`: TEXT
*   `password`: TEXT (Bcrypt hash)
*   `preferences`: TEXT (JSON string of user settings, default `{}`)
*   `enabled`: INTEGER (1 = active, 0 = disabled, default 0)
*   `last_login`: DATETIME

#### `boards`
Stores the board metadata and the entire board state.
*   `id`: INTEGER PK
*   `user_id`: INTEGER FK -> users.id
*   `name`: TEXT
*   `collection`: TEXT (Group name for organizing boards)
*   `position`: INTEGER (Sort order in the dashboard, default 0)
*   `data`: **TEXT (JSON Blob)** - *Critical*
    *   This column stores the entire board structure (columns, tasks, order, colors) as a stringified JSON object.
    *   **Structure**:
        ```json
        {
          "columns": { "[id]": { "id": "...", "title": "...", "tasks": [] } },
          "columnOrder": [],
          "gradientColors": [],
          "archiveHistory": [],
          "bookmarks": [],
          "contactIds": [],
          "contactTags": {},
          "stickies": []
        }
        ```
    *   This design avoids complex joins for task retrieval but requires parsing/stringifying on every read/write.

#### `contacts`
Stores address book entries.
*   `id`: INTEGER PK
*   `user_id`: INTEGER FK -> users.id
*   `name`: TEXT NOT NULL
*   `title`: TEXT
*   `company`: TEXT
*   `email`: TEXT
*   `phone`: TEXT
*   `avatarUrl`: TEXT
*   `status`: TEXT (default 'ACTIVE')
*   `created_at`: TIMESTAMP (default CURRENT_TIMESTAMP)
*   **Constraint**: `UNIQUE(user_id, email)` - Ensures distinct contacts per user.

## 3. Data Flow & Architecture

### Backend Pattern (MVC-ish)
1.  **Route**: `server/routes/boards.js` receives a request (e.g., `GET /api/v1.1/boards/:id`).
2.  **Controller**: `server/controllers/boardController.js` validates input and calls the model.
3.  **Model**: `server/models/board.js` executes the SQL query.
    *   *Crucial Step*: The model parses the `data` column from a JSON string into a JavaScript object before returning it to the controller. Conversely, it stringifies the object before writing to SQL.
4.  **Response**: The controller sends the JSON response to the client.

### Frontend State Management
The frontend uses a mix of **Context API** for global state and **Custom Hooks** for complex local state.

*   **`AuthContext`**: Manages the authenticated user and JWT token.
*   **`BoardContext`**: Manages the **list of boards** (for the sidebar and dashboard). It *does not* manage the active board's internal state.
*   **`useBoardData` (Hook)**: Manages the **active board's state** (columns, tasks, archive, board notes).
    *   Used by `Board.js`.
    *   Handles optimistic UI updates for drag-and-drop.
    *   Provides handlers like `handleAddTask`, `handleUpdateColumn`, `handleArchiveTask`.
*   **`useBoardDnd` (Hook)**: Abstracts `@dnd-kit` sensors and collision detection logic.

## 4. API & Networking

*   **Base URL**: Configured via `REACT_APP_SERVER_URL` (default: `http://localhost:3001/api/v1.1`).
*   **Client**: `client/src/services/api.js` (Axios instance).
*   **Authentication**:
    *   **JWT**: Tokens are stored in `localStorage`.
    *   **Interceptors**:
        *   **Request**: Automatically appends `Authorization: Bearer <token>`.
        *   **Response**: Intercepts `401 Unauthorized` responses to trigger an automatic logout/redirect.

## 5. Development Workflow

### Prerequisites
*   Node.js v18+
*   npm

### Running Locally
1.  **Server**:
    ```bash
    cd server
    npm install
    # Create .env (see .env.example)
    npm start # Runs on port 3001
    ```
2.  **Client**:
    ```bash
    cd client
    npm install
    # Create .env (REACT_APP_SERVER_URL=http://localhost:3001/api/v1.1)
    npm start # Runs on port 3000
    ```

### Testing
*   **Server**: `cd server && npm test` (Jest)
*   **Client**: `cd client && npm test` (Jest + React Testing Library)

### Key Conventions
*   **Styling**: Material-UI (MUI) components with `sx` prop for custom styles.
*   **JSON in SQL**: Always remember that modifying a task or board note requires fetching the board, parsing `data`, modifying the object, and updating the entire `data` field.
