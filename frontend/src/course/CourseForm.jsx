import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import axios from '../api';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router';

const CourseForm = ({ course: initialCourse, onSubmit, handleClose, isModal }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id: courseId } = useParams();
    const [banner, setBanner] = useState(null); // New state for the banner image
    const [bannerPreview, setBannerPreview] = useState(initialCourse?.banner || null); //Preview URL
    const [course, setCourse] = useState(initialCourse || { title: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (courseId && !initialCourse) {
            const fetchCourse = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/courses/courses/${courseId}/`);
                    setCourse(response.data);
                    setBannerPreview(response.data.banner);
                } catch (error) {
                    console.error('Error fetching course:', error);
                    setSnackbarMessage('Error fetching course.');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                } finally {
                    setLoading(false);
                }
            };
            fetchCourse();
        }
    }, [courseId, initialCourse]);

    const handleChange = (event) => {
        setCourse({ ...course, [event.target.name]: event.target.value });
        setErrors({ ...errors, [event.target.name]: '' });
    };

    const handleBannerChange = (event) => {
        setBanner(event.target.files[0]);
        setBannerPreview(URL.createObjectURL(event.target.files[0])); // Preview the selected image
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const accessToken = localStorage.getItem('token');

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data', // Important for file upload
            };

            const formData = new FormData();
            formData.append('title', course.title);
            formData.append('description', course.description);

            if (banner) {
                formData.append('banner', banner); // Append the banner image to the form data
            }

            let response;
            if (courseId) {
                response = await axios.patch(`/api/courses/courses/${courseId}/`, formData, { headers });
            } else {
                response = await axios.post('/api/courses/courses/', formData, { headers });
            }

            if (response.status === (courseId ? 200 : 201)) {
                setSnackbarMessage(courseId ? 'Course updated successfully!' : 'Course created successfully!');
                setSnackbarSeverity('success');
                if (onSubmit) {
                    onSubmit(response.data);
                }

                if (isModal) {
                    handleClose();
                } else if (!courseId) {
                    navigate('/courses/' + response.data.id);
                }

            } else {
                if (response.data && response.data.errors) {
                    setErrors(response.data.errors);
                } else {
                    setSnackbarMessage(courseId ? 'Error updating course.' : 'Error creating course.');
                    setSnackbarSeverity('error');
                }
            }

        } catch (error) {
            console.error('Error submitting course:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setSnackbarMessage(courseId ? 'An error occurred during update.' : 'An error occurred during creation.');
                setSnackbarSeverity('error');
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
        <Box sx={{ mt: 4, maxWidth: 600, margin: '0 auto', p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography variant="h5" gutterBottom>
                {courseId ? 'Edit Course' : 'Create Course'}
            </Typography>
            <form onSubmit={handleSubmit}>
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Banner Image</Typography>
                <input type="file" name="banner" onChange={handleBannerChange} />
                {bannerPreview && (
                    <Box sx={{ mt: 1 }}>
                        <img src={bannerPreview} alt="Banner Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                    </Box>
                )}
            </Box>
                <TextField
                    label="Title"
                    name="title"
                    value={course.title}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    error={!!errors.title}
                    helperText={errors.title}
                />
                <TextField
                    label="Description"
                    name="description"
                    value={course.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    required
                    error={!!errors.description}
                    helperText={errors.description}
                />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : (courseId ? 'Update' : 'Create')}
                </Button>

                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </form>
        </Box>
    );
};

export default CourseForm;