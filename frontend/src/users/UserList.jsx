import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Pagination,
  CircularProgress,
  Box,
  Rating,
  Button,
} from '@mui/material';
import axios from '../api';
import Grid from '@mui/material/Grid2';
import { Link } from 'react-router';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);

      try {
        const offset = (page - 1) * limit;
        const response = await axios.get(
          `/api/user/users/?is_teacher=true&limit=${limit}&offset=${offset}`
        );
        setTeachers(response.data.results);
        setCount(response.data.count);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError(err.message || 'Error fetching teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [page]);

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}> {/* Centered loading */}
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Teachers
      </Typography>
      <Grid container spacing={2}>
        {teachers.map((teacher) => (
          <Grid item xs={12} sm={6} md={4} key={teacher.email}> {/* Responsive grid */}
            <TeacherCard teacher={teacher} />
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(count / limit)}
        page={page}
        onChange={handleChangePage}
        color="primary"
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
};

const TeacherCard = ({ teacher }) => (
  <Card>
    <CardMedia
      component="img"
      height="200"
      image={teacher.profile_pic || "/default_pic.jpg"} 
      alt={teacher.name}
    />
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {teacher.name}
      </Typography>
      <Typography variant="body2">

        Bio: {teacher.bio?teacher.bio.substring(0, 30)+". . ." : "No bio available"}
      </Typography>
      <Typography variant="body2">
        Total Courses: {teacher.total_course}
      </Typography>
      <Rating
        value={teacher.avg_rating}
        readOnly
        precision={0.5}
        />
    </CardContent>
        <Button size='small' component={Link} to={`/?teacher=${teacher.id}`}>
          View Courses
        </Button>
  </Card>
);

export default TeacherList;