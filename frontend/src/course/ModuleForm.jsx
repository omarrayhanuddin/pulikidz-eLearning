import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
    Modal
} from '@mui/material';
import axios from '../api';


const ModuleFormModal = ({ open, handleClose, module: initialModule, onSubmit, courseId }) => {
    const [module, setModule] = useState(initialModule || { title: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialModule) {
            setModule(initialModule);
        } else {
            setModule({ title: '', description: '' });
        }
    }, [initialModule]);

    const handleChange = (event) => {
        setModule({ ...module, [event.target.name]: event.target.value });
        setErrors({ ...errors, [event.target.name]: '' });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const accessToken = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            };


            if (initialModule) { // Editing
                const response = await axios.put(`/api/courses/modules/${initialModule.id}/`, module, { headers });
                if (response.status === 200) {
                    setSnackbarMessage('Module updated successfully!');
                    setSnackbarSeverity('success');
                    onSubmit(response.data); // Pass updated module data back
                } else {
                    setSnackbarMessage('Error updating module.');
                    setSnackbarSeverity('error');
                }
            } else { // Creating
                const response = await axios.post('/api/courses/modules/', { ...module, course: courseId }, { headers });
                if (response.status === 201) {
                    setSnackbarMessage('Module created successfully!');
                    setSnackbarSeverity('success');
                    onSubmit(response.data); // Pass new module data back
                } else {
                    setSnackbarMessage('Error creating module.');
                    setSnackbarSeverity('error');
                }
            }
        } catch (error) {
            console.error('Error submitting module:', error);
            setSnackbarMessage('An error occurred during module submission.');
            setSnackbarSeverity('error');
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };


    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="module-form-modal-title"
            aria-describedby="module-form-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography id="module-form-modal-title" variant="h5" component="h2" gutterBottom>
                    {initialModule ? 'Edit Module' : 'Add Module'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Title"
                        name="title"
                        value={module.title}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        error={!!errors.title}
                        helperText={errors.title}
                    />

                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : (initialModule ? 'Update' : 'Create')}
                    </Button>

                    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </form>
            </Box>
        </Modal>
    );
};

export default ModuleFormModal;