// StatusModal.js (Renamed to StatusDialog.js)
import React, { useState, useEffect } from 'react';
import {
    Dialog, // Changed from Modal to Dialog
    DialogTitle, // Added DialogTitle
    DialogContent, // Added DialogContent
    DialogActions, // Added DialogActions
    Box,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import axios from '../api';
import { useAuth } from '../auth/AuthContext';

const style = { /* ... your dialog style - adjust as needed ... */ };

const StatusModal = ({ open, handleClose, status }) => { // Renamed component
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alert, setAlert] = useState({ type: 'success', message: '' });

    useEffect(() => {
        setContent(status?.content || ''); // Simplified with optional chaining
    }, [status]);

    const handleChange = (event) => {
        setContent(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const data = { content };
            const url = status ? `/api/feedback/status-updates/${status.id}/` : '/api/feedback/status-updates/';
            const method = status ? axios.put : axios.post;

            await method(url, data); // No need to store the response if not used

            setAlert({ type: 'success', message: status ? 'Status updated!' : 'Status created!' });
            setSnackbarOpen(true);
            handleClose();

        } catch (error) {
            console.error('Error creating/updating status:', error);
            setAlert({ type: 'error', message: error.message || 'Error creating/updating status.' });
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarClose = (event, reason) => { /* ... same as before ... */ };

    return (
        <Dialog open={open} 
        onClose={handleClose} 
        aria-labelledby="status-dialog-title" 
        aria-describedby="status-dialog-description" 
        fullWidth  
        maxWidth="sm"
        >
            <DialogTitle id="status-dialog-title"> {/* Added DialogTitle */}
                {status ? 'Update Status' : 'Create Status'}
            </DialogTitle>
            <DialogContent> {/* Added DialogContent */}
                <Box sx={style}> {/* You can keep the Box for styling */}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Status Content"
                            multiline
                            rows={4}
                            fullWidth
                            margin="normal"
                            value={content}
                            onChange={handleChange}
                            required
                        />
                        <DialogActions> {/* Added DialogActions */}
                            <Button onClick={handleClose}>Cancel</Button> {/* Cancel button */}
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? <CircularProgress size={20} color="inherit" /> : status ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </form>
                </Box>
            </DialogContent>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={alert.type} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default StatusModal;