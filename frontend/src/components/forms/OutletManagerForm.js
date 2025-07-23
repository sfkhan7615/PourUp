import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { userAPI, outletAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const OutletManagerForm = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    outlet_id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    date_of_birth: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      loadOutlets();
      resetForm();
    }
  }, [open]);

  const loadOutlets = async () => {
    try {
      const response = await outletAPI.getMyOutlets();
      setOutlets(response.data.data?.outlets || []);
    } catch (error) {
      console.error('Failed to load outlets:', error);
      toast.error('Failed to load outlets');
    }
  };

  const resetForm = () => {
    setFormData({
      outlet_id: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      date_of_birth: null
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date_of_birth: date
    }));
    
    if (errors.date_of_birth) {
      setErrors(prev => ({
        ...prev,
        date_of_birth: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.outlet_id) {
      newErrors.outlet_id = 'Please select an outlet';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear();
      if (age < 18) {
        newErrors.date_of_birth = 'Outlet manager must be at least 18 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : null
      };

      await userAPI.createOutletManager(submitData);
      
      toast.success('Outlet manager created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create outlet manager:', error);
      const message = error.response?.data?.message || 'Failed to create outlet manager';
      toast.error(message);
      
      // Handle specific validation errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedOutlet = outlets.find(outlet => outlet.id === formData.outlet_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6">Add Outlet Manager</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Outlet Selection */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Select an outlet to assign a manager. The manager will be able to create and manage experiences for this outlet.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.outlet_id}>
                <InputLabel>Select Outlet *</InputLabel>
                <Select
                  value={formData.outlet_id}
                  onChange={handleChange('outlet_id')}
                  label="Select Outlet *"
                  startAdornment={
                    <InputAdornment position="start">
                      <StoreIcon />
                    </InputAdornment>
                  }
                >
                  {outlets.map((outlet) => (
                    <MenuItem key={outlet.id} value={outlet.id}>
                      <Box>
                        <Typography variant="body1">{outlet.outlet_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {outlet.location} • {outlet.business_types?.join(', ')}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.outlet_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.outlet_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Selected Outlet Info */}
            {selectedOutlet && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary.contrastText">
                    Selected Outlet: {selectedOutlet.outlet_name}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    Location: {selectedOutlet.location}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    Business Types: {selectedOutlet.business_types?.join(', ')}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Manager Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.first_name}
                onChange={handleChange('first_name')}
                error={!!errors.first_name}
                helperText={errors.first_name}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.last_name}
                onChange={handleChange('last_name')}
                error={!!errors.last_name}
                helperText={errors.last_name}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email || 'This will be used for login credentials'}
                inputProps={{ maxLength: 255 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password *"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password || 'Minimum 8 characters'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password *"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={handleChange('confirm_password')}
                error={!!errors.confirm_password}
                helperText={errors.confirm_password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth *"
                  value={formData.date_of_birth}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date_of_birth,
                      helperText: errors.date_of_birth
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Creating...' : 'Create Manager'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OutletManagerForm; 