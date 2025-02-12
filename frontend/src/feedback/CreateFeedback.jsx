import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from '../api'; 
import { useAuth } from '../auth/AuthContext';

const CreateFeedback = ({ courseId, open, handleClose, refreshFeedback }) => {
  const { user } = useAuth(); 
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post('/api/feedback/feedbacks/', {
        course: courseId,
        rating: rating,
        comment: comment,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.status === 201) { 
        setSnackbarMessage('Feedback submitted successfully!');
        setSnackbarSeverity('success');
        refreshFeedback(); // Refresh the feedback list in the parent component
        handleClose(); // Close the dialog
        setRating(5); // Reset rating
        setComment(''); // Reset comment
      } else {
        setSnackbarMessage('Comment can to be empty.');
        setSnackbarSeverity('error');
      }
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSnackbarMessage('Comment can to be empty.');
      setSnackbarSeverity('error');
    } finally {
      setSubmitting(false);
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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Submit Feedback</DialogTitle>
      <DialogContent>
        <Rating
          name="rating"
          value={rating}
          precision={0.5}
          onChange={handleRatingChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Comment"
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={handleCommentChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Submit'} {/* Loading indicator */}
        </Button>
      </DialogActions>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Dialog>
  );
};

export default CreateFeedback;