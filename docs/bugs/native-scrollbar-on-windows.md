# Bug Report: Native Scrollbar Visible on Sidebar (Windows)

## Status
**Root Cause Identified**

## Description
On Windows-based browsers (Chrome, Edge), an "ugly" native system scrollbar is visible in the application's sidebar. This contrasts with the clean, hidden-scrollbar aesthetic maintained in the rest of the application (e.g., Kanban boards and columns).

## Root Cause Analysis
The issue is caused by missing custom scrollbar styling in the `Sidebar` component. While other scrollable components in the project explicitly hide scrollbars to maintain a consistent UI, the `Sidebar` component's `MuiDrawer` uses default browser behavior.

1.  **Platform Discrepancy**: On macOS (the primary development environment), scrollbars are "overlay" elements that are thin and transparent. On Windows, browsers default to a permanent, wide, and high-contrast grey scrollbar when content overflows.
2.  **Missing CSS in Sidebar**: The `Sidebar.js` component lacks the `::-webkit-scrollbar` and `scrollbar-width` properties that are used elsewhere in the codebase.
3.  **Inconsistent Application**: The project successfully hides scrollbars in `Board.js` and `Column.js`, but this pattern was not applied to the `MuiDrawer-paper` element in the sidebar.

## Evidence from Code

### Sidebar.js (Current - Missing Styles)
In `client/src/components/Sidebar.js`:
```javascript
<MuiDrawer
    variant="permanent"
    sx={{
        '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isDrawerOpen ? drawerWidth : collapsedWidth,
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            // Missing scrollbar styling here
        },
    }}
>
```

### Column.js (Reference - Correct Styles)
In `client/src/components/Column.js`:
```javascript
'&::-webkit-scrollbar': {
    display: 'none',
},
scrollbarWidth: 'none',
msOverflowStyle: 'none',
```

## Recommended Fix
Apply the standard "hidden scrollbar" styles to the `MuiDrawer-paper` component in `client/src/components/Sidebar.js`. This will ensure the sidebar remains scrollable via mouse wheel/touch while hiding the native scrollbar track on all platforms.
