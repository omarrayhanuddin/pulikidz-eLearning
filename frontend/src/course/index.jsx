import React, { useEffect, useState } from 'react';
import ImgMediaCard from '../components/ImgCard';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import axios from '../api';
import { useAuth } from '../auth/AuthContext';
import { TextField, IconButton, Box, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useDebounce } from 'use-debounce';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import CourseForm from './CourseForm';
import GenericModal from './CourseModal';

export default function Courses({ instructor = "", student = "" }) {
  const [queryParams] = useSearchParams();
  console.log(queryParams);
  
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);
  const limit = 25;
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [courseToEdit, setCourseToEdit] = useState(null);

  const handleOpenCreateCourseModal = () => {
    setModalTitle('');
    setCourseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditCourseModal = (course) => {
    setModalTitle('Edit Course');
    setCourseToEdit(course);
    setIsModalOpen(true);
  };

  const handleCourseFormSubmit = (newCourseData) => {
    console.log('Course data submitted:', newCourseData);
    setIsModalOpen(false); // Close the modal after submit
    navigate('/courses/edit/' + newCourseData.id); // Redirect after successful creation
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const isCourseFormPage = location.pathname === '/courses/create' || location.pathname.startsWith('/courses/edit/');

  if (isCourseFormPage) {
    return <CourseForm course={null} onSubmit={handleCourseFormSubmit} isModal={false} />;
  }

  const params = {
    instructor:instructor,
    student:student
  }


  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(location.search);
        let teacher_params = new URLSearchParams(location.search).get("teacher")
        console.log("teach", teacher_params);
        
        if (teacher_params){
          params.teacher = teacher_params
        }
        const offset = (page - 1) * limit;
        const response = await axios.get(
          `/api/courses/courses/?limit=${limit}&offset=${offset}&search=${searchQuery}`,
          {params:params}
        );
        setCourses(response.data.results);
        setCount(response.data.count);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Error fetching courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [page, debouncedSearchQuery, instructor, student]);

  const totalPages = Math.ceil(count / limit);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1); // Reset page to 1 after clearing search
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 2 }}>
        <TextField
          label="Search Courses"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, marginRight: 1, width: '50%' }}
        />

        {searchQuery && (
          <IconButton onClick={handleClearSearch}>
            <ClearIcon />
          </IconButton>
        )}
      </Box>

      {instructor ? <Button variant="contained" onClick={handleOpenCreateCourseModal} sx={{marginLeft:5}}>
                Create Course
            </Button> : ""}

      <Grid container sx={{ marginLeft: 5, marginTop: 2 }} spacing={2}>
        {courses.map((course) => (
          <Grid key={course.id} size={4}>
            <ImgMediaCard course={course} isAuthenticated={isAuthenticated} />
          </Grid>
        ))}
      </Grid>
      <Grid container sx={{ justifyContent: 'center', marginTop: 2, marginBottom: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Grid>
      <GenericModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        title={modalTitle}
      >
        <CourseForm course={courseToEdit} onSubmit={handleCourseFormSubmit} handleClose={handleCloseModal} isModal={true} />
      </GenericModal>
    </>
  );
}