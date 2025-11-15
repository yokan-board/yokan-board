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
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm} color="error">
                    {confirmButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteConfirmationDialog;
