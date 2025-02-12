import React, { useState } from 'react';
import { TextField, Button, Container, Box, Typography, CircularProgress, Alert, Modal } from '@mui/material';
import { useNavigate } from 'react-router';
import axios from '../api';
import { useAuth } from './AuthContext';

const Signup = ({ onClose }) => {
  const {login} = useAuth();
  const navigate = useNavigate();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      await signupUser(name, email, password);
      setShowVerificationModal(true); // Show verification modal
    } catch (err) {
      if (err.response && err.response.data) {
        const validationErrors = err.response.data;
        const newFieldErrors = {};
        let generalErrorMessage = "";

        for (const field in validationErrors) {
          if (field === "message") {
            generalErrorMessage = validationErrors[field].join("\n");
          } else {
            newFieldErrors[field] = validationErrors[field].join(", ");
          }
        }

        setFieldErrors(newFieldErrors);
        if (generalErrorMessage) {
          setError(generalErrorMessage);
        }
      } else {
        setError(err.message || "An error occurred during signup.");
      }
      console.error("Signup error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const signupUser = async (name, email, password) => {
    try {
      const response = await axios.post('/api/user/register/', {
        name,
        email,
        password,
        confirm_password:confirmPassword
      });
      console.log(response);
      
      const token = response.data.access_token
      login(token)
      navigate("/")
    } catch (error) {
       throw error;
    }
  };

  const handleRedirect = () => {
    onClose();
    navigate('/');
  };
  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    handleRedirect(); // Redirect after closing the verification modal
  };

  const verificationModalStyle = { // Style for the verification modal
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: 'center', // Center the text within the modal
  };

  return (
    <Container maxWidth="sm">
            <Modal
        open={showVerificationModal}
        onClose={handleCloseVerificationModal}
        aria-labelledby="verification-modal-title"
        aria-describedby="verification-modal-description"
      >
        <Box sx={verificationModalStyle}>
          <Typography id="verification-modal-title" variant="h6" component="h2" gutterBottom>
            Registration Successful!
          </Typography>
          <Typography id="verification-modal-description" variant="body1">
            A verification email has been sent to {email}. Please check your inbox to activate your account.
          </Typography>
          <Button variant="contained" onClick={handleCloseVerificationModal} sx={{ mt: 2 }}>
            OK
          </Button>
        </Box>
      </Modal>
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            fullWidth
            required
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            fullWidth
            required
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
            required
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            fullWidth
            required
            error={!!fieldErrors.confirm_password}
            helperText={fieldErrors.confirm_password}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} color="white" /> : 'Sign Up'}
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mt: 1 }} onClose={handleRedirect}>
              {successMessage}
            </Alert>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default Signup;