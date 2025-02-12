import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import axios from '../api';
import { useAuth } from '../auth/AuthContext';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const ChangePasswordModal = ({ open, handleClose }) => {
    const { login } = useAuth();
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alert, setAlert] = useState({ type: 'success', message: '' });

    const handleChange = (event) => {
        setPasswordData({ ...passwordData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            if (passwordData.new_password !== passwordData.confirm_new_password) {
                throw new Error("New password and confirm password do not match.");
            }

            const response = await axios.post('/api/user/change-password/', passwordData);

            login(response.data.access_token)
            setAlert({ type: 'success', message: 'Password changed successfully!' });
            setSnackbarOpen(true);
            handleClose(); // Close the modal on success

        } catch (error) {
            console.error('Error changing password:', error);
            setAlert({ type: 'error', message: error.message || 'Error changing password.' });
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
            setPasswordData({ // Clear the form after submit
                old_password: '',
                new_password: '',
                confirm_new_password: '',
            });
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="change-password-modal"
                aria-describedby="change-password-modal-description"
            >
                <Box sx={style}>
                    <Typography id="change-password-modal-title" variant="h6" component="h2">
                        Change Password
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Old Password"
                            type="password"
                            name="old_password"
                            value={passwordData.old_password}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            name="confirm_new_password"
                            value={passwordData.confirm_new_password}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
                        </Button>
                    </form>
                </Box>
            </Modal>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={alert.type} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ChangePasswordModal;