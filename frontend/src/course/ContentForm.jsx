import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
    Modal,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import axios from '../api';

const ModuleContentFormModal = ({ open, handleClose, content: initialContent, onContentUpdated, moduleId }) => {
    const [content, setContent] = useState(initialContent || {
        title: '',
        content_type: 'text',
        text: '',
        file: null,
        video_url: '',
        image: null,
    });
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialContent) {
            setContent(initialContent);
        } else {
            setContent({
                title: '',
                content_type: 'text',
                text: '',
                file: null,
                video_url: '',
                image: null,
            });
        }
    }, [initialContent]);

    const handleChange = (event) => {
        setContent({ ...content, [event.target.name]: event.target.value });
        setErrors({ ...errors, [event.target.name]: '' });
    };

    const handleFileChange = (event) => {
        setContent({ ...content, file: event.target.files[0] });
    };

    const handleImageChange = (event) => {
        setContent({ ...content, image: event.target.files[0] });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const accessToken = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
            };

            const formData = new FormData();
            formData.append('title', content.title);
            formData.append('content_type', content.content_type);

            if (content.content_type === 'text') {
                formData.append('text', content.text);
            } else if (content.content_type === 'file') {
                formData.append('file', content.file);
            } else if (content.content_type === 'video') {
                formData.append('video_url', content.video_url);
            } else if (content.content_type === 'image') {
                formData.append('image', content.image);
            }
            formData.append('module', moduleId);

            let updatedContent;

            if (initialContent) {
                const response = await axios.put(`/api/courses/module-contents/${initialContent.id}/`, formData, { headers });
                updatedContent = response.data;
                setSnackbarMessage('Content updated successfully!');
                setSnackbarSeverity('success');
            } else {
                const response = await axios.post('/api/courses/module-contents/', formData, { headers });
                updatedContent = response.data;
                setSnackbarMessage('Content created successfully!');
                setSnackbarSeverity('success');
            }

            if (onContentUpdated) {
                onContentUpdated(updatedContent);
            }

        } catch (error) {
            console.error('Error submitting content:', error);
            setSnackbarMessage('An error occurred during content submission.');
            setSnackbarSeverity('error');
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
            aria-labelledby="module-content-form-modal-title"
            aria-describedby="module-content-form-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 500,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography id="module-content-form-modal-title" variant="h5" component="h2" gutterBottom>
                    {initialContent ? 'Edit Content' : 'Add Content'}
                </Typography>
                <form onSubmit={handleSubmit}>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="content-type-label">Content Type</InputLabel>
                        <Select
                            labelId="content-type-label"
                            id="content_type"
                            name="content_type"
                            value={content.content_type}
                            label="Content Type"
                            onChange={handleChange}
                        >
                            <MenuItem value="text">Text</MenuItem>
                            <MenuItem value="file">File</MenuItem>
                            <MenuItem value="video">Video</MenuItem>
                            <MenuItem value="image">Image</MenuItem>
                        </Select>
                    </FormControl>

                    {content.content_type === 'text' && (
                        <TextField
                            label="Text Content"
                            name="text"
                            value={content.text}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            fullWidth
                            margin="normal"
                            error={!!errors.text}
                            helperText={errors.text}
                        />
                    )}

                    {content.content_type === 'file' && (
                        <input type="file" name="file" onChange={handleFileChange} />
                    )}

                    {content.content_type === 'video' && (
                        <TextField
                            label="Video URL"
                            name="video_url"
                            value={content.video_url}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.video_url}
                            helperText={errors.video_url}
                        />
                    )}

                    {content.content_type === 'image' && (
                        <input type="file" name="image" onChange={handleImageChange} />
                    )}

                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : (initialContent ? 'Update' : 'Create')}
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

export default ModuleContentFormModal;