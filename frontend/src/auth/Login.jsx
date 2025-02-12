import React, { useState } from 'react';
import { TextField, Button, Container, Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router';
import axios from '../api';

const Login = ({ onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await fetchToken(email, password);
      const success = await login(token);

      if (success) {
        onClose(); // Close the modal
        navigate(window.location.pathname); // Redirect to dashboard
      } else {
        setError("Invalid Credentials");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login."); // Display error message
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchToken = async (email, password) => {
    try {
      const response = await axios.post('/api/user/login/', {
        email,
        password,
      });
      
      return response.data.access_token;
    } catch (error) {
       console.error("Login request error:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Login failed");
      } else if (error.request) {
        throw new Error("Network error during login");
      } else {
        throw new Error("Login request failed");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} color="white" /> : 'Login'}
          </Button>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default Login;