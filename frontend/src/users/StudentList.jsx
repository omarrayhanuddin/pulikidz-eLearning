import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    CircularProgress,
    Container,
    Pagination,
    TextField,
    InputAdornment,
    IconButton,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "../api";
import { useDebounce } from "use-debounce";

const EnrolledStudents = ({ courseId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBlocked, setSearchBlocked] = useState(false);
    const [debouncedSearchQuery] = useDebounce(searchTerm, 1000);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handleBlockUnblock = async (enrollmentId, isBlocked) => {
        try {
            setStudents((prevStudents) =>
                prevStudents.map((student) =>
                    student.id === enrollmentId ? { ...student, loading: true } : student
                )
            );

            await axios.patch(
                `/api/courses/block-unblock-student/${enrollmentId}/`,
                { is_blocked: !isBlocked }
            );

            setStudents((prevStudents) =>
                prevStudents.map((student) =>
                    student.id === enrollmentId ? { ...student, is_blocked: !isBlocked, loading: false } : student
                )
            );
        } catch (error) {
            console.error("Error blocking/unblocking student:", error);
        }
    };

    useEffect(() => {
        const fetchEnrolledStudents = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    page: page,
                    search: searchTerm,
                    is_blocked: searchBlocked,
                    course: courseId,
                });

                const response = await axios.get(
                    `/api/courses/enrolled-students/?${params.toString()}`
                );

                setStudents(response.data.results || []);
                setCount(response.data.count || 0);
            } catch (err) {
                console.error("Error fetching enrolled students:", err);
                setError(err.message || "Error fetching enrolled students.");
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledStudents();
    }, [courseId, page, debouncedSearchQuery, searchBlocked]);

    if (loading) {
        return (
            <Container sx={{ mt: 4, textAlign: "center" }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4, textAlign: "center" }}>
                <Typography color="error">Error: {error}</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Enrolled Students
            </Typography>

            <TextField
                label="Search by name or email"
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton>
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={searchBlocked}
                            onChange={(e) => setSearchBlocked(e.target.checked)}
                        />
                    }
                    label="Show blocked Students"
                />
            </FormGroup>

            {students.length > 0 ? (
                <List>
                    {students.map((enrollment) => (
                        <ListItem
                            key={enrollment.id}
                            secondaryAction={
                                <Button
                                    variant="outlined"
                                    color={enrollment.is_blocked ? "success" : "error"}
                                    onClick={() => handleBlockUnblock(enrollment.id, enrollment.is_blocked)}
                                    disabled={enrollment.loading}
                                >
                                    {enrollment.loading ? (
                                        <CircularProgress size={20} />
                                    ) : enrollment.is_blocked ? (
                                        "Unblock"
                                    ) : (
                                        "Block"
                                    )}
                                </Button>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar alt={enrollment.student.name} src={enrollment.student.profile_pic} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={enrollment.student.name}
                                secondary={enrollment.student.email}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body2">
                    No students found matching your criteria.
                </Typography>
            )}

            <Pagination
                count={Math.ceil(count / 10)}
                page={page}
                onChange={handlePageChange}
                sx={{ mt: 2, display: "flex", justifyContent: "center" }}
            />
        </Box>
    );
};

export default EnrolledStudents;