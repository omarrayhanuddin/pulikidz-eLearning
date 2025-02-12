import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Pagination,
    CircularProgress,
    Box,
    Button,
    Tooltip,
    IconButton,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from '../api';
import StatusModal from './StatusModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../auth/AuthContext';

const StatusList = () => {
    const { user, isAuthenticated } = useAuth();
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [showOnlyMyStatuses, setShowOnlyMyStatuses] = useState(false);

    const fetchStatuses = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page };

            if (showOnlyMyStatuses) {
                params.user = user.id;
            }

            const res = await axios.get('/api/feedback/status-updates/', {
                params: params,
            });

            setStatuses(res.data.results);
            setCount(res.data.count);
        } catch (err) {
            console.error('Error fetching statuses:', err);
            setError(err.message || 'Error fetching statuses');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        fetchStatuses();
    }, [page, showOnlyMyStatuses]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleOpenModal = (status = null) => {
        setSelectedStatus(status);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedStatus(null);
        fetchStatuses();
    };

    const handleCheckboxChange = (event) => {
        setShowOnlyMyStatuses(event.target.checked);
        setPage(1);
    };

    const handleDeleteStatus = async (e)=>{
        if (window.confirm("Are you sure you want to delete this status ?")) {
            try {
                await axios.delete(`/api/feedback/status-updates/${e}/`);
                fetchStatuses();
            } catch (error) {
                console.error("Error deleting module:", error);
            }
        }
    }

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
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                {!isAuthenticated ? "" :
                    <Button variant="contained" onClick={() => handleOpenModal()}>
                        Create Status
                    </Button>
                }
            </Box>
            <List>
                {isAuthenticated && (
                    <FormControlLabel
                        control={<Checkbox checked={showOnlyMyStatuses} onChange={handleCheckboxChange} />}
                        label="My Statuses"
                        sx={{ mb: 2 }}
                    />
                )}
                {statuses.map((status) => (
                    <ListItem key={status.id} secondaryAction={
                        <Tooltip title="Edit">
                            {
                                !isAuthenticated ? "" : user.email === status.user.email ?
                                <div>

                                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenModal(status)}>
                                        <EditIcon />
                                    </IconButton> 
                                    <IconButton color='error' edge="end" aria-label="edit" onClick={() => handleDeleteStatus(status.id)}>
                                        <DeleteIcon/>
                                    </IconButton> 
                                </div>:
                                    ""
                            }
                        </Tooltip>
                    }>

                        <Avatar alt={status.user.name} src={status.user.profile_pic} sx={{ mr: 2 }} />
                        <ListItemText primary={status.content} secondary={formatDate(status.created_at)} />
                    </ListItem>
                ))}
            </List>
            <Pagination
                count={Math.ceil(count / 10)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
            />
            <StatusModal open={modalOpen} handleClose={handleCloseModal} status={selectedStatus} />
        </Container>
    );
};

export default StatusList;