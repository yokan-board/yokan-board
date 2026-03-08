# Fix Plan: Native Scrollbar Visible on Sidebar (Windows)

## Problem
On Windows browsers, a native system scrollbar is visible in the application's sidebar, which is inconsistent with the rest of the application's UI where scrollbars are hidden.

## Proposed Solution
Apply the "hidden scrollbar" CSS properties to the `MuiDrawer-paper` element in the `Sidebar` component. This will ensure that the sidebar remains scrollable but the scrollbar itself is not visible, maintaining a consistent look and feel across all platforms.

## Implementation Steps

### Phase 1: Implementation
1.  **Modify `client/src/components/Sidebar.js`**:
    - Update the `sx` prop of the `MuiDrawer` component.
    - Add the following styles to the `& .MuiDrawer-paper` selector:
        ```javascript
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        ```

### Phase 2: Verification
1.  **Visual Inspection**: Since I cannot directly view the UI on a Windows machine, I will rely on the fact that these styles are already successfully used in other components like `Column.js` and `Board.js`.
2.  **Code Review**: Verify that the styles are applied correctly within the `sx` object.
3.  **Linting**: Run `npm run lint` in the `client` directory to ensure no linting errors are introduced.

## Reference
The implementation will match the pattern used in `client/src/components/Column.js`:
```javascript
'&::-webkit-scrollbar': {
    display: 'none',
},
scrollbarWidth: 'none',
msOverflowStyle: 'none',
```
