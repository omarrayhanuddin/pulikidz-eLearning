import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from 'react-router';
import axios from '../api';
import { Rating } from '@mui/material';
import { useAuth } from '../auth/AuthContext';


export default function ImgMediaCard({ course, isDetail = false }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    
    const handleEnroll = async (courseId) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `/api/courses/courses/${courseId}/enroll/`
            );
            if (isDetail) {
                window.location.reload()
            } else {
                navigate(`/courses/${courseId}`)
            }
        } catch (err) {
            console.error('Error fetching teachers:', err);
            setLoading(false);
        }
    }

    return (
        <Card sx={{ maxWidth: 320 }}>
            <CardMedia
                component="img"
                height="140"
                image={course.banner ? course.banner : "/default.png"}
                alt={course.title}
            />
            <CardContent>

                <Typography gutterBottom variant="h6" component="div">
                    {course.title.substring(0, 20)+". . ."}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>

                    {isDetail ? course.description : course.description.substring(0, 50) + ". . ."}
                </Typography>
                <Rating
                    value={course.rating}
                    readOnly
                    precision={0.5}
                />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    Instructor: {course.instructor.name}
                </Typography>
            </CardContent>
            <CardActions>
                {window.location.pathname.includes("edit")?"":user?.email === course.instructor.email ? <Button
                    size="small"
                    variant='contained'
                    color='warning'
                    component={Link}
                    to={`/courses/edit/${course.id}`}
                    loading={loading}
                >
                    Edit
                </Button> :
                    course.has_enrolled ? "" :
                        user ? <Button 
                        color='secondary' 
                        variant='contained' 
                        size="small" 
                        loading={loading}
                        onClick={() => handleEnroll(course.id)}>Enroll</Button> :
                        <small>
                            Login to enroll.
                        </small>
                }
                {
                    isDetail ? "" :
                        <Button
                            size="small"
                            variant='contained'
                            component={Link}
                            to={`/courses/${course.id}`}
                        >
                            View
                        </Button>
                }
            </CardActions>
        </Card>
    );
}
