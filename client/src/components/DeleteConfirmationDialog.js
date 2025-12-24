import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

function DeleteConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title = 'Confirm Deletion',
    message = 'Are you sure you want to delete this board? This action is not reversible.',
    confirmButtonText = 'Delete', // New prop with default value
}) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onConfirm} color="error">
                    {confirmButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteConfirmationDialog;
