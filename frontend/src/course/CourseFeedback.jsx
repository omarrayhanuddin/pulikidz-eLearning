import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Pagination, Rating, Button } from '@mui/material';
import Grid from "@mui/material/Grid2"
import axios from '../api';
import CreateFeedback from '../feedback/CreateFeedback';
import { useAuth } from '../auth/AuthContext';


const CourseFeedback = ({ courseId, instructorEmail }) => {

  const {user, isAuthenticated} = useAuth();
  const [isCreateFeedbackOpen, setIsCreateFeedbackOpen] = useState(false);

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const handleCreateFeedbackOpen = () => {
    setIsCreateFeedbackOpen(true);
  };

  const handleCreateFeedbackClose = () => {
    setIsCreateFeedbackOpen(false);
  };

  const refreshFeedbackList = () => {
    window.location.reload()
    console.log("Refreshing Feedback list")
  }
  const limit = 10; // Adjust as needed

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);

      try {
        const offset = (page - 1) * limit;
        const response = await axios.get(
          `/api/feedback/feedbacks/?course=${courseId}&limit=${limit}&offset=${offset}`
        );
        setFeedback(response.data.results);
        setCount(response.data.count);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err.message || 'Error fetching feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [courseId, page]);

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <CreateFeedback
        courseId={courseId}
        open={isCreateFeedbackOpen}
        handleClose={handleCreateFeedbackClose}
        refreshFeedback={refreshFeedbackList} // Pass the refresh function
      />
      <Grid container spacing={2}>
        <Grid item md={6}>
        <Typography variant="h6" gutterBottom>
            Course Feedback
          </Typography>
          
        </Grid>
        <Grid item md={6}>
          {isAuthenticated?user.email === instructorEmail?"":
          <Button variant='text' onClick={handleCreateFeedbackOpen}>
          Give feedback
        </Button>:""
          }
          
        </Grid>

      </Grid>
      {feedback.length > 0 ? (
        feedback.map((item) => (
          <Box key={item.id} sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              {item.student.name}
            </Typography>
            <Rating
              value={item.rating}
              readOnly
              precision={0.5}
            />
            <Typography variant="body2">{item.comment}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(item.created_at).toLocaleString()}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2">No feedback available for this course.</Typography>
      )}

      <Pagination
        count={Math.ceil(count / limit)}
        page={page}
        onChange={handleChangePage}
        color="primary"
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />
      <CreateFeedback
        courseId={courseId}
        open={isCreateFeedbackOpen}
        handleClose={handleCreateFeedbackClose}
        refreshFeedback={refreshFeedbackList} // Pass the refresh function
      />
    </Box>
  );
};

export default CourseFeedback;