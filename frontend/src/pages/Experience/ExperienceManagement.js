import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Stack,
  Avatar,
  Badge,
  CardMedia,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Event as EventIcon,
  AttachMoney,
  Schedule,
  People,
  Restaurant,
  Store as StoreIcon,
  Business as BusinessIcon,
  Image as ImageIcon,
  LocalOffer,
} from '@mui/icons-material';
import { experienceAPI, outletAPI, handleApiError, handleApiSuccess } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';
import TimeSlotManager from '../../components/common/TimeSlotManager';
import { toast } from 'react-toastify';

const ExperienceManagement = () => {
  const { user, isSuperAdmin, isWineryAdmin, isOutletManager } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState({
    outlet_id: '',
    title: '',
    business_types: '',
    price_per_person: '',
    description: '',
    images: [],
    menu_item_title: '',
    menu_item_description: '',
    time_slots: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let experiencesResponse, outletsResponse;
      
      if (isOutletManager) {
        // Outlet managers: Load their assigned outlets and experiences
        const [myExperiencesResp, assignedOutletsResp] = await Promise.all([
          experienceAPI.getMyExperiences(),
          outletAPI.getAssignedOutlets(),
        ]);
        experiencesResponse = myExperiencesResp;
        outletsResponse = assignedOutletsResp;
      } else if (isWineryAdmin) {
        // Winery admins: Load their outlets and experiences
        const [allExperiencesResp, myOutletsResp] = await Promise.all([
          experienceAPI.getExperiences(),
          outletAPI.getMyOutlets(),
        ]);
        experiencesResponse = allExperiencesResp;
        outletsResponse = myOutletsResp;
      } else if (isSuperAdmin) {
        // Super admins: Load all experiences and outlets
        const [allExperiencesResp, allOutletsResp] = await Promise.all([
          experienceAPI.getExperiences(),
          outletAPI.getOutlets(),
        ]);
        experiencesResponse = allExperiencesResp;
        outletsResponse = allOutletsResp;
      }
      
      setExperiences(experiencesResponse.data.data?.experiences || []);
      setOutlets(outletsResponse.data.data?.outlets || []);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      outlet_id: '',
      title: '',
      business_types: '',
      price_per_person: '',
      description: '',
      images: [],
      menu_item_title: '',
      menu_item_description: '',
      time_slots: [],
    });
    setTabValue(0);
  };

  const handleAdd = () => {
    setEditingExperience(null);
    resetForm();
    
    // For outlet managers with only one outlet, pre-select it
    if (isOutletManager && outlets.length === 1) {
      setFormData(prev => ({
        ...prev,
        outlet_id: outlets[0].id
      }));
    }
    
    setOpenDialog(true);
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setFormData({
      outlet_id: experience.outlet_id || '',
      title: experience.title || '',
      business_types: experience.business_types || '',
      price_per_person: experience.price_per_person || '',
      description: experience.description || '',
      images: experience.images || [],
      menu_item_title: experience.menu_item_title || '',
      menu_item_description: experience.menu_item_description || '',
      time_slots: experience.time_slots || [],
    });
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleDelete = async (experience) => {
    if (window.confirm(`Are you sure you want to delete "${experience.title}"?`)) {
      try {
        await experienceAPI.deleteExperience(experience.id);
        toast.success('Experience deleted successfully!');
        loadData();
      } catch (error) {
        console.error('Failed to delete experience:', error);
        toast.error('Failed to delete experience');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.outlet_id || !formData.title || !formData.business_types || !formData.price_per_person) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.time_slots || formData.time_slots.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    try {
      setLoading(true);
      
      // Convert image objects to URLs for API
      const submitData = {
        ...formData,
        images: formData.images.map(img => img.url || img),
      };
      
      if (editingExperience) {
        await experienceAPI.updateExperience(editingExperience.id, submitData);
        toast.success('Experience updated successfully!');
      } else {
        await experienceAPI.createExperience(submitData);
        toast.success('Experience created successfully!');
      }
      
      setOpenDialog(false);
      loadData();
    } catch (error) {
      console.error('Failed to save experience:', error);
      toast.error(error.response?.data?.message || 'Failed to save experience');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleTimeSlotsChange = (timeSlots) => {
    setFormData(prev => ({
      ...prev,
      time_slots: timeSlots
    }));
  };

  // Get available business types for selected outlet
  const getAvailableBusinessTypes = () => {
    const selectedOutlet = outlets.find(outlet => outlet.id === formData.outlet_id);
    return selectedOutlet?.business_types || [];
  };

  // Check if user can edit/delete an experience
  const canModifyExperience = (experience) => {
    if (isSuperAdmin) return true;
    if (isWineryAdmin) return true; // Can modify all experiences in their outlets
    if (isOutletManager) {
      // Check if the experience belongs to an outlet they manage
      return outlets.some(outlet => outlet.id === experience.outlet_id);
    }
    return false;
  };

  // Get display name for outlet manager role
  const getRoleDisplayName = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isWineryAdmin) return 'Winery Admin';
    if (isOutletManager) return 'Outlet Manager';
    return 'User';
  };

  if (loading) {
    return <LoadingSpinner message="Loading experiences..." />;
  }

  // Debug info to help troubleshoot
  console.log('ExperienceManagement Debug:', {
    loading,
    isSuperAdmin,
    isWineryAdmin,
    isOutletManager,
    experiencesCount: experiences.length,
    outletsCount: outlets.length,
    userRole: user?.role
  });

  return (
    <Box>
      {/* Debug Panel - Remove this after testing */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6">🔧 Debug Info (Remove after testing)</Typography>
        <Typography variant="body2">Page: Experience Management</Typography>
        <Typography variant="body2">Loading: {loading ? 'Yes' : 'No'}</Typography>
        <Typography variant="body2">Role: {getRoleDisplayName()}</Typography>
        <Typography variant="body2">Experiences Count: {experiences.length}</Typography>
        <Typography variant="body2">Available Outlets: {outlets.length}</Typography>
        <Typography variant="body2">User ID: {user?.id}</Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Experience Management</Typography>
          <Typography variant="body2" color="text.secondary">
            {isOutletManager && `Managing experiences for ${outlets.length} assigned outlet(s)`}
            {isWineryAdmin && `Managing experiences for your outlets`}
            {isSuperAdmin && `Managing all experiences in the system`}
          </Typography>
        </Box>
        
        {(isSuperAdmin || isWineryAdmin || isOutletManager) && outlets.length > 0 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{
              backgroundColor: 'secondary.main',
              '&:hover': { backgroundColor: 'secondary.dark' }
            }}
          >
            🍷 ADD EXPERIENCE 🍷
          </Button>
        )}
      </Box>

      {/* Show alert if outlet manager has no outlets */}
      {isOutletManager && outlets.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You are not currently assigned to any outlets. Please contact your Winery Admin to assign you to an outlet.
          </Typography>
        </Alert>
      )}

      {/* Show info for outlet managers */}
      {isOutletManager && outlets.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Your Assigned Outlets:</strong> {outlets.map(outlet => outlet.outlet_name).join(', ')}
          </Typography>
        </Alert>
      )}

      {experiences.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No experiences found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {isOutletManager && outlets.length === 0 && 'You need to be assigned to an outlet first.'}
            {isOutletManager && outlets.length > 0 && 'Start by creating your first experience for your assigned outlet(s).'}
            {(isWineryAdmin || isSuperAdmin) && 'Start by creating your first experience.'}
          </Typography>
          {(isSuperAdmin || isWineryAdmin || isOutletManager) && outlets.length > 0 && (
            <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
              Create Experience
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {experiences.map((experience) => (
            <Grid item xs={12} md={6} lg={4} key={experience.id}>
              <Card>
                {/* Experience Image */}
                {experience.images && experience.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={experience.images[0]}
                    alt={experience.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}

                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {experience.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`$${experience.price_per_person}`}
                        color="primary"
                        size="small"
                        icon={<AttachMoney />}
                      />
                    </Box>
                  </Box>

                  {/* Outlet Info */}
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <StoreIcon fontSize="small" />
                    {outlets.find(outlet => outlet.id === experience.outlet_id)?.outlet_name || 'Unknown Outlet'}
                  </Typography>

                  {/* Business Type */}
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BusinessIcon fontSize="small" />
                    {experience.business_types}
                  </Typography>

                  {/* Description */}
                  {experience.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {experience.description.length > 100 
                        ? `${experience.description.substring(0, 100)}...`
                        : experience.description
                      }
                    </Typography>
                  )}

                  {/* Menu Item */}
                  {experience.menu_item_title && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Restaurant fontSize="small" />
                        <strong>Menu:</strong> {experience.menu_item_title}
                      </Typography>
                    </Box>
                  )}

                  {/* Time Slots Summary */}
                  {experience.time_slots && experience.time_slots.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule fontSize="small" />
                        {experience.time_slots.length} time slot(s) available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available slots: {experience.time_slots.filter(slot => slot.is_available).length}
                      </Typography>
                    </Box>
                  )}

                  {/* Images Count */}
                  {experience.images && experience.images.length > 1 && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ImageIcon fontSize="small" />
                      {experience.images.length} images
                    </Typography>
                  )}
                </CardContent>

                <CardActions>
                  {canModifyExperience(experience) && (
                    <>
                      <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(experience)}>
                        Edit
                      </Button>
                      <Button size="small" startIcon={<Delete />} color="error" onClick={() => handleDelete(experience)}>
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Experience Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingExperience ? 'Edit Experience' : 'Add New Experience'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
              <Tab label="Basic Information" />
              <Tab label="Menu & Description" />
              <Tab label="Time Slots" />
              <Tab label="Images" />
            </Tabs>

            {/* Tab 0: Basic Information */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                {/* Outlet Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Select Outlet</InputLabel>
                    <Select
                      value={formData.outlet_id}
                      onChange={handleFieldChange('outlet_id')}
                      label="Select Outlet"
                      disabled={isOutletManager && outlets.length === 1} // Auto-selected for single outlet managers
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
                  </FormControl>
                </Grid>

                {/* Experience Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Experience Title"
                    value={formData.title}
                    onChange={handleFieldChange('title')}
                    placeholder="e.g., Wine Tasting & Vineyard Tour"
                  />
                </Grid>

                {/* Business Type - filtered by selected outlet */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Business Type</InputLabel>
                    <Select
                      value={formData.business_types}
                      onChange={handleFieldChange('business_types')}
                      label="Business Type"
                      disabled={!formData.outlet_id}
                    >
                      {getAvailableBusinessTypes().map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formData.outlet_id && getAvailableBusinessTypes().length === 0 && (
                    <Typography variant="caption" color="error">
                      No business types available for selected outlet
                    </Typography>
                  )}
                </Grid>

                {/* Price Per Person */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Price Per Person"
                    type="number"
                    value={formData.price_per_person}
                    onChange={handleFieldChange('price_per_person')}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={handleFieldChange('description')}
                    placeholder="Describe the experience, what's included, duration, etc."
                  />
                </Grid>
              </Grid>
            )}

            {/* Tab 1: Menu & Description */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Menu Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Add details about food or beverages included in this experience.
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Menu Item Title"
                    value={formData.menu_item_title}
                    onChange={handleFieldChange('menu_item_title')}
                    placeholder="e.g., Cheese & Charcuterie Board"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Menu Item Description"
                    value={formData.menu_item_description}
                    onChange={handleFieldChange('menu_item_description')}
                    placeholder="Describe the menu items, ingredients, pairings, etc."
                  />
                </Grid>
              </Grid>
            )}

            {/* Tab 2: Time Slots */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Experience Time Slots
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Configure when this experience is available. You can add multiple time slots with different capacities.
                </Typography>
                <TimeSlotManager
                  value={formData.time_slots}
                  onChange={handleTimeSlotsChange}
                />
              </Box>
            )}

            {/* Tab 3: Images */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Experience Images
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload images that showcase your experience. High-quality photos help attract more bookings.
                </Typography>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                />
              </Box>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : (editingExperience ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ExperienceManagement; 