import React, { useState, useEffect} from 'react';
import {
    Container, Typography, Tabs, Tab, Box, Accordion,
    AccordionSummary, AccordionDetails, Button, CircularProgress,
    CardMedia,
    Modal
} from '@mui/material';
import Grid from "@mui/material/Grid2"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLocation, useNavigate, useParams } from 'react-router';
import axios from '../api';
import { useAuth } from '../auth/AuthContext';
import ImgMediaCard from '../components/ImgCard';
import ModuleFormModal from './ModuleForm';
import CourseForm from './CourseForm';
import GenericModal from './CourseModal';
import ModuleContentFormModal from './ContentForm';



function CourseEdit() {
    const { isAuthenticated } = useAuth();
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const [refetchCourse, setRefetchCourse] = useState(false);
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [courseToEdit, setCourseToEdit] = useState(null);
    const navigate = useNavigate();
    const handleCourseDelete = async (courseId) => {
        const accessToken = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };
        if (window.confirm("Are you sure you want to delete this module's content ?")) {
            try {
                await axios.delete(`/api/courses/courses/${courseId}/`, { headers });
                navigate("/my-courses")
            } catch (error) {
                console.error("Error deleting module:", error);
            }
        }
    }

    const handleOpenEditCourseModal = (course) => {
        setModalTitle('Edit Course');
        setCourseToEdit(course);
        setIsModalOpen(true);
    };

    const handleCourseFormSubmit = (newCourseData) => {
        console.log('Course data submitted:', newCourseData);
        setIsModalOpen(false); // Close the modal after submit
        refetchCourse == true ? setRefetchCourse(false) : setRefetchCourse(true);
        // window.location.reload()
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchCourseData();
    }, [id, refetchCourse]);
    const fetchCourseData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [courseResponse, modulesResponse] = await Promise.all([
                axios.get(`/api/courses/courses/${id}/`),
                axios.get(`/api/courses/modules/?course=${id}`)
            ]);
            setCourse(courseResponse.data);
            setModules(modulesResponse.data.results);
        } catch (err) {
            setError(err.message || 'Error fetching course details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 4, textAlign: 'center' }}><Typography variant="h6" color="error">Error: {error}</Typography></Container>;
    if (!course) return <Container sx={{ mt: 4, textAlign: 'center' }}><Typography variant="h5">Course not found.</Typography></Container>;

    return (
        <Container sx={{ mt: 4 }}>
            <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
                <Grid item xs={12} md={4}>
                    <Button variant='outlined' sx={{ marginBottom: 2 }} onClick={() => handleOpenEditCourseModal(course)}>Edit</Button>
                    <Button
                        onClick={() => {
                            handleCourseDelete(course.id);
                        }}
                        variant='outlined'
                        size='medium'
                        sx={{ marginBottom: 2, marginLeft: 2 }}
                        color="error"
                    >
                        Delete
                    </Button>
                    <ImgMediaCard course={course} isDetail />
                </Grid>
                <Grid item xs={12} md={8} sx={{ flexGrow: 1 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
                        <Tab label="Modules" />
                    </Tabs>
                    <Box sx={{ mt: 2, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                        {activeTab === 0 && <ModulesTab modules={modules} isAuthenticated={isAuthenticated} hasEnrolled={course.has_enrolled} refetchCourseData={fetchCourseData} />}
                    </Box>
                </Grid>
            </Grid>
            <GenericModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                title={modalTitle}
            >
                <CourseForm course={courseToEdit} onSubmit={handleCourseFormSubmit} handleClose={handleCloseModal} isModal={true} />
            </GenericModal>
        </Container>
    );
}

const ModulesTab = ({ modules, isAuthenticated, hasEnrolled, refetchCourseData }) => {
    const { id } = useParams();
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [moduleToEdit, setModuleToEdit] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDeleteModule = async (moduleId) => {
        const accessToken = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };

        if (window.confirm("Are you sure you want to delete this module?")) { // Confirmation dialog
            try {
                await axios.delete(`/api/courses/modules/${moduleId}/`, { headers });
                refetchCourseData();
            } catch (error) {
                console.error("Error deleting module:", error);
            }
        }
    };


    const handleOpenModuleModal = (module = null) => {
        setModuleToEdit(module);
        setIsModuleModalOpen(true);
    };

    const handleCloseModuleModal = () => {
        setIsModuleModalOpen(false);
        setModuleToEdit(null);
    };

    const handleModuleFormSubmit = async (moduleData) => {
        try {
            refetchCourseData();
        } catch (error) {
            console.error("Error submitting module:", error);
        } finally {
            handleCloseModuleModal();
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Modules
                <Button sx={{ ml: 2 }} variant='contained' size='small' onClick={() => handleOpenModuleModal()}>Add</Button>
            </Typography>
            <ModuleFormModal
                open={isModuleModalOpen}
                handleClose={handleCloseModuleModal}
                module={moduleToEdit}
                onSubmit={handleModuleFormSubmit}
                courseId={id}
            />
            {modules.length > 0 ? (
                modules.map((module) => (
                    <Box key={module.id}>
                        <Button variant='outlined' size='small' sx={{ marginTop: 2 }} onClick={() => handleOpenModuleModal(module)}>Edit</Button>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModule(module.id);
                            }}
                            variant='outlined'
                            size='small'
                            sx={{ marginTop: 2, marginLeft: 2 }}
                            color="error"
                        >
                            Delete
                        </Button>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">{module.title}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {isAuthenticated ? (hasEnrolled ? <ModuleContentComponent refetchData={refetchCourseData} moduleId={module.id} moduleContents={module.module_contents} /> : "You must enroll to see the content.") : "Please log in to view module content."}
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                ))
            ) : (
                <Typography variant="body2">No modules available for this course.</Typography>
            )}
        </Box>
    );
};


const ModuleContentComponent = ({ moduleContents, moduleId, refetchData }) => {
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [contentToEdit, setContentToEdit] = useState(null); // For editing content
    const [moduleIdForContent, setModuleIdForContent] = useState(null); // To store the current module id for add content

    const [openImageModal, setOpenImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleDeleteContent = async (e, contentID) => {
        const accessToken = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };
        if (window.confirm("Are you sure you want to delete this module's content ?")) { // Confirmation dialog
            try {
                await axios.delete(`/api/courses/module-contents/${contentID}/`, { headers });
                refetchData();
            } catch (error) {
                console.error("Error deleting module:", error);
            }
        }
    }


    const handleOpenImage = (image) => {
        setSelectedImage(image);
        setOpenImageModal(true);
    };

    const handleCloseImageModal = () => {
        setOpenImageModal(false);
        setSelectedImage(null);
    };

    const handleOpenAddContentModal = (moduleId) => {
        setContentToEdit(null); // Clear for creating
        setModuleIdForContent(moduleId); // Set the current module id
        setIsContentModalOpen(true);
    };

    const handleOpenEditContentModal = (content) => {
        setContentToEdit(content); // Set the content to edit
        setModuleIdForContent(content.module); // Set the module id for edit
        setIsContentModalOpen(true);
    };

    const handleCloseContentModal = () => {
        setIsContentModalOpen(false);
        setContentToEdit(null);
        setModuleIdForContent(null);
    };

    const handleContentUpdated = (updatedContent) => {
        setIsContentModalOpen(false);
        refetchData();
    };
    return (
        <Box sx={{ padding: 2 }}>
            <Button variant='contained' size='small' onClick={(e) => {
                e.stopPropagation();
                handleOpenAddContentModal(moduleId);
            }}>
                Add Content
            </Button>
            {moduleContents && moduleContents.length > 0 ? (
                moduleContents.map((content) => (
                    <Grid container spacing={2} key={content.id} alignItems="center"> {/* Align items vertically */}
                        <Grid item xs={12} sm={8}> {/* Adjust grid sizes as needed */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">{content.title || "Content"}</Typography>
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
                                {content.file && <Typography variant="body2">File: {content.file}</Typography>} {/* Display file name */}
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4} textAlign="right"> {/* Align buttons to the right */}
                            <Button onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditContentModal(content);
                            }}
                                variant='outlined'
                                size='small'
                                sx={{ marginRight: 2 }}
                            >
                                Edit
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteContent(e, content.id)
                                }}
                                color="error"
                                variant='outlined'
                                size='small'
                            >
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
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

            <ModuleContentFormModal
                open={isContentModalOpen}
                handleClose={handleCloseContentModal}
                content={contentToEdit}
                onContentUpdated={handleContentUpdated}
                moduleId={moduleId}
            />
        </Box>
    );
};

export default CourseEdit;
