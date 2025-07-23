import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import { LocationOn, Save } from '@mui/icons-material';
import { websiteUserAPI, handleWebsiteApiError } from '../../services/websiteApi';
import { useWebsiteAuth } from '../../contexts/WebsiteAuthContext';

const WebsiteSettings = () => {
  const { user, updateUser } = useWebsiteAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    location: user?.location || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await websiteUserAPI.updateLocation(formData);
      updateUser({
        ...user,
        location: formData.location,
      });
      setSuccess('Settings updated successfully');
    } catch (error) {
      setError(handleWebsiteApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mt: 4, p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Location Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Set your preferred location to see relevant outlets and experiences.
              </Typography>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your location"
                InputProps={{
                  startAdornment: (
                    <LocationOn color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Save />}
                sx={{
                  backgroundColor: '#722F37',
                  '&:hover': { backgroundColor: '#5D252B' },
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Account Information */}
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">
                {user?.first_name} {user?.last_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {new Date(user?.created_at).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default WebsiteSettings; 