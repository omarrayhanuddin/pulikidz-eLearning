// CourseDetail.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CardMedia,
  Box,
  Tabs,
  Tab,
  // Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Modal,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams } from 'react-router';
import axios from '../api';
import { useAuth } from '../auth/AuthContext';
import CourseFeedback from './CourseFeedback';
import ImgMediaCard from '../components/ImgCard';
import LiveChat from '../chat/Chat';
import EnrolledStudents from '../users/StudentList';


function CourseDetail() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const courseResponse = await axios.get(`/api/courses/courses/${id}/`);
        setCourse(courseResponse.data);

        const modulesResponse = await axios.get(`/api/courses/modules/?course=${id}`);
        setModules(modulesResponse.data.results);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(err.message || 'Error fetching course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);


  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Error: {error}</Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Course not found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
        <Grid item xs={12} md={4}>
          <CourseDetailsCard course={course} courseId={id} />
        </Grid>
        <Grid item xs={12} md={8} sx={{ flexGrow: 1 }}>
          <CourseTabs
            has_enrolled={course.has_enrolled}
            isBlocked={course.is_blocked}
            instructor={course.instructor.email}
            activeTab={activeTab}
            handleChangeTab={handleChangeTab}
            isAuthenticated={isAuthenticated}
            modules={modules}
            courseId={id}
          />
        </Grid>
      </Grid>

    </Container>
  );
}

const CourseDetailsCard = ({ course, courseId }) => {

  return <Container>
    <ImgMediaCard course={course} isDetail />

    <CourseFeedback courseId={courseId} instructorEmail={course.instructor.email} />

  </Container>
};

const CourseTabs = ({ activeTab, handleChangeTab, isAuthenticated, modules, courseId, has_enrolled, isBlocked, instructor }) => {

  const { user } = useAuth();

  const tabs = [

    { label: "Modules", component: <ModulesTab isBlocked={isBlocked} has_enrolled={has_enrolled} modules={modules} isAuthenticated={isAuthenticated} /> },

  ];

  if (isAuthenticated&& has_enrolled) {

    tabs.push({ label: "Live Chat", component: <LiveChat courseId={courseId} /> });

    if (user.email === instructor) {

      tabs.push({ label: "Enrolled Students", component: <EnrolledStudents courseId={courseId} /> });

    }

  }

  return (

    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={activeTab} onChange={handleChangeTab} aria-label="course tabs" centered>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>
      <Box sx={{ mt: 2, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {tabs[activeTab]?.component}
      </Box>
    </Box>

  );

};


const ModulesTab = ({ modules, isAuthenticated, has_enrolled, isBlocked }) => {

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Modules
      </Typography>
      {modules.length > 0 ? (
        modules.map((module) => (
          <Accordion key={module.id} sx={{ width: "100%" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" >{module.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {isAuthenticated ? (
                isBlocked ? "You are blocked from this course" : (
                  has_enrolled ? <ModuleContentComponent moduleContents={module.module_contents} /> : "You must enroll to see the content."
                )
              ) : (
                <Typography variant="body2">Please log in to view module content.</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body2">No modules available for this course.</Typography>
      )}
    </Box>
  )
};

const ModuleContentComponent = ({ moduleContents }) => {
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpenImage = (image) => {
    setSelectedImage(image);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setSelectedImage(null);
  };

  return (
    <Box sx={{ padding: 2 }}> {/* Add padding to content area */}
      {moduleContents && moduleContents.length > 0 ? (
        moduleContents.map((content) => (
          <Box key={content.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              {content.title ||
                (content.text && "Text Content") ||
                (content.image && "Image Content") ||
                (content.video_url && "Video Content") ||
                "Content"}
            </Typography>
            {content.text && <Typography variant="body2">{content.text}</Typography>}
            {content.image && (
              <Grid item xs={12} sm={4} textAlign="center"> {/* Center the image */}
                <CardMedia
                  component="img"
                  height="200"
                  image={content.image}
                  alt={content.title || "Module Image"}
                  onClick={() => handleOpenImage(content.image)} // Open modal on click
                  sx={{ cursor: 'pointer' }} // Make cursor pointer to indicate clickability
                />
              </Grid>
            )}
            {content.video_url && <Typography variant="body2">Video URL: {content.video_url}</Typography>}
          </Box>
        ))
      ) : (
        <Typography variant="body2">No content available for this module.</Typography>
      )}
      <Modal
        open={openImageModal}
        onClose={handleCloseImageModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90%',
          maxHeight: '90%',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          overflow: 'auto', // Add overflow for scrolling
        }}>
          <img
            src={selectedImage}
            alt="Full Size Image"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </Box>
      </Modal>
    </Box>
  );
};


export default CourseDetail;