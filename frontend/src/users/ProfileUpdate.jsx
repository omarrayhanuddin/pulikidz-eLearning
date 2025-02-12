import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from '../api';
import EditIcon from '@mui/icons-material/Edit';
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

const UpdateProfileModal = ({open, handleClose}) => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alert, setAlert] = useState({ type: 'success', message: '' });
    const [preview, setPreview] = useState(null); // For image preview
    const Input = styled('input')({
        display: 'none',
    });

    const handleOpen = () => setOpen(true);

    useEffect(() => {
        if (user) {
            setProfile({ ...user }); // Initialize profile with user data
            setPreview(user.profile_pic);
        }
    }, [user]);

    const handleChange = (event) => {
        setProfile({ ...profile, [event.target.name]: event.target.value });
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfile((prevProfile) => ({ ...prevProfile, profile_pic: file })); // Store file object
            setPreview(URL.createObjectURL(file)); // Update preview
        }
    };
    

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
    
        try {
            const formData = new FormData();
            
            for (const key in profile) {
                if (key === 'profile_pic' && profile[key] instanceof File) {
                    formData.append(key, profile[key]); // Append only if it's a File
                } else if (key !== 'profile_pic') {
                    formData.append(key, profile[key]); // Append other fields normally
                }
            }
    
            const response = await axios.put('/api/user/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            // updateUser(response.data); // Update user context
            setAlert({ type: 'success', message: 'Profile updated successfully!' });
            setSnackbarOpen(true);
            window.location.reload()
    
        } catch (error) {
            console.error('Error updating profile:', error);
            setAlert({ type: 'error', message: 'Error updating profile.' });
            setSnackbarOpen(false);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    if (!profile) {
        return ""
    }

    return (
        <div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Update Profile
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Avatar
                                src={preview} // Use preview for the src
                                alt="Profile Picture"
                                sx={{ width: 100, height: 100 }}
                            />
                        </Box>
                        <label htmlFor="profile_pic">
                            <Input accept="image/*" id="profile_pic" name="profile_pic" type="file" onChange={handleImageChange} />
                            <Button variant="contained" component="span">
                                Upload
                            </Button>
                        </label>
                        <TextField
                            label="Name"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Bio"
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            fullWidth
                            margin="normal"
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Update'}
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

export default UpdateProfileModal;