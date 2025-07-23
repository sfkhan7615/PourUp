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
  CardMedia,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Business as BusinessIcon,
  Web,
  Email,
  Phone,
  Instagram,
  Facebook,
  LinkedIn,
  RateReview,
  Image as ImageIcon,
  Language,
  Work,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { businessAPI, handleApiError, handleApiSuccess } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';

const BusinessManagement = () => {
  const { isSuperAdmin } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState({
    business_name: '',
    legal_business_name: '',
    phone_number: '',
    business_email: '',
    website_url: '',
    description: '',
    primary_title: '',
    job_title: '',
    instagram_url: '',
    facebook_url: '',
    linkedin_url: '',
    yelp_url: '',
    logo_images: [],
  });

  useEffect(() => {
    loadBusinesses();
    if (isSuperAdmin) {
      loadPendingBusinesses();
    }
  }, [isSuperAdmin]);

  const loadBusinesses = async () => {
    try {
      const endpoint = isSuperAdmin ? businessAPI.getBusinesses : businessAPI.getMyBusinesses;
      const response = await endpoint();
      setBusinesses(response.data.data?.businesses || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingBusinesses = async () => {
    try {
      const response = await businessAPI.getPendingBusinesses();
      setPendingBusinesses(response.data.data?.businesses || []);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert image objects to URLs for API
      const submitData = {
        ...formData,
        logo_images: formData.logo_images.map(img => img.url || img),
      };

      if (editingBusiness) {
        await businessAPI.updateBusiness(editingBusiness.id, submitData);
        handleApiSuccess('Business updated successfully');
      } else {
        await businessAPI.createBusiness(submitData);
        handleApiSuccess('Business created successfully');
      }
      
      setOpenDialog(false);
      resetForm();
      loadBusinesses();
      if (isSuperAdmin) loadPendingBusinesses();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleApproveBusiness = async (id) => {
    try {
      await businessAPI.approveBusiness(id);
      handleApiSuccess('Business approved successfully');
      loadBusinesses();
      loadPendingBusinesses();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleRejectBusiness = async (id) => {
    try {
      await businessAPI.rejectBusiness(id);
      handleApiSuccess('Business rejected');
      loadBusinesses();
      loadPendingBusinesses();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setFormData({
      business_name: business.business_name || '',
      legal_business_name: business.legal_business_name || '',
      phone_number: business.phone_number || '',
      business_email: business.business_email || '',
      website_url: business.website_url || '',
      description: business.description || '',
      primary_title: business.primary_title || '',
      job_title: business.job_title || '',
      instagram_url: business.instagram_url || '',
      facebook_url: business.facebook_url || '',
      linkedin_url: business.linkedin_url || '',
      yelp_url: business.yelp_url || '',
      logo_images: business.logo_images ? business.logo_images.map((url, index) => ({
        id: index,
        url: url,
        name: `Logo ${index + 1}`,
        uploaded: true,
      })) : [],
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        await businessAPI.deleteBusiness(id);
        handleApiSuccess('Business deleted successfully');
        loadBusinesses();
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      business_name: '',
      legal_business_name: '',
      phone_number: '',
      business_email: '',
      website_url: '',
      description: '',
      primary_title: '',
      job_title: '',
      instagram_url: '',
      facebook_url: '',
      linkedin_url: '',
      yelp_url: '',
      logo_images: [],
    });
    setEditingBusiness(null);
    setTabValue(0);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (images) => {
    setFormData({
      ...formData,
      logo_images: images,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'instagram': return <Instagram fontSize="small" />;
      case 'facebook': return <Facebook fontSize="small" />;
      case 'linkedin': return <LinkedIn fontSize="small" />;
      case 'yelp': return <RateReview fontSize="small" />;
      default: return <Language fontSize="small" />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading businesses..." />;
  }

  // Debug info to help troubleshoot
  console.log('BusinessManagement Debug:', {
    loading,
    isSuperAdmin,
    businessesCount: businesses.length,
    userRole: 'Check AuthContext for role info'
  });

  return (
    <Box>
      {/* Debug Panel - Remove this after testing */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6">🔧 Debug Info (Remove after testing)</Typography>
        <Typography variant="body2">Page: Business Management</Typography>
        <Typography variant="body2">Loading: {loading ? 'Yes' : 'No'}</Typography>
        <Typography variant="body2">Is Super Admin: {isSuperAdmin ? 'Yes' : 'No'}</Typography>
        <Typography variant="body2">Businesses Count: {businesses.length}</Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Business Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={{ 
            backgroundColor: 'error.main', // Make it red so it's very visible
            '&:hover': { backgroundColor: 'error.dark' }
          }}
        >
          🚀 ADD BUSINESS 🚀
        </Button>
      </Box>

      {/* Pending Approvals for Super Admin */}
      {isSuperAdmin && pendingBusinesses.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Approvals ({pendingBusinesses.length})
          </Typography>
          <Grid container spacing={2}>
            {pendingBusinesses.map((business) => (
              <Grid item xs={12} md={6} key={business.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      {business.logo_images && business.logo_images.length > 0 ? (
                        <Avatar
                          src={business.logo_images[0]}
                          alt={business.business_name}
                          sx={{ width: 56, height: 56 }}
                        />
                      ) : (
                        <Avatar sx={{ width: 56, height: 56 }}>
                          <BusinessIcon />
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{business.business_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {business.legal_business_name}
                        </Typography>
                        <Chip
                          label={business.approval_status}
                          color={getStatusColor(business.approval_status)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {business.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{business.business_email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{business.phone_number}</Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApproveBusiness(business.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleRejectBusiness(business.id)}
                    >
                      Reject
                    </Button>
                    <Button size="small" onClick={() => handleEdit(business)}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Business List */}
      <Grid container spacing={3}>
        {businesses.map((business) => (
          <Grid item xs={12} md={6} lg={4} key={business.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Business Header with Logo */}
              <Box sx={{ p: 2, pb: 0 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                  {business.logo_images && business.logo_images.length > 0 ? (
                    <Avatar
                      src={business.logo_images[0]}
                      alt={business.business_name}
                      sx={{ width: 48, height: 48 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 48, height: 48 }}>
                      <BusinessIcon />
                    </Avatar>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" noWrap>
                      {business.business_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {business.legal_business_name}
                    </Typography>
                    <Chip
                      label={business.approval_status}
                      color={getStatusColor(business.approval_status)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                <Typography variant="body2" sx={{ mb: 2 }} noWrap>
                  {business.description}
                </Typography>

                {/* Contact Info */}
                <Stack spacing={1}>
                  {business.business_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" noWrap>
                        {business.business_email}
                      </Typography>
                    </Box>
                  )}
                  {business.phone_number && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{business.phone_number}</Typography>
                    </Box>
                  )}
                  {business.website_url && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Web fontSize="small" color="action" />
                      <Typography variant="body2" noWrap>
                        <a href={business.website_url} target="_blank" rel="noopener noreferrer">
                          Website
                        </a>
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Social Media */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {business.instagram_url && (
                    <Tooltip title="Instagram">
                      <IconButton
                        size="small"
                        component="a"
                        href={business.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon('instagram')}
                      </IconButton>
                    </Tooltip>
                  )}
                  {business.facebook_url && (
                    <Tooltip title="Facebook">
                      <IconButton
                        size="small"
                        component="a"
                        href={business.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon('facebook')}
                      </IconButton>
                    </Tooltip>
                  )}
                  {business.linkedin_url && (
                    <Tooltip title="LinkedIn">
                      <IconButton
                        size="small"
                        component="a"
                        href={business.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon('linkedin')}
                      </IconButton>
                    </Tooltip>
                  )}
                  {business.yelp_url && (
                    <Tooltip title="Yelp">
                      <IconButton
                        size="small"
                        component="a"
                        href={business.yelp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon('yelp')}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Business Info */}
                {(business.primary_title || business.job_title) && (
                  <Box sx={{ mt: 2 }}>
                    {business.primary_title && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work fontSize="small" color="action" />
                        <Typography variant="body2">
                          {business.primary_title}
                        </Typography>
                      </Box>
                    )}
                    {business.job_title && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {business.job_title}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
              
              <CardActions>
                <Button size="small" onClick={() => handleEdit(business)}>
                  <Edit fontSize="small" sx={{ mr: 0.5 }} />
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => handleDelete(business.id)}>
                  <Delete fontSize="small" sx={{ mr: 0.5 }} />
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {businesses.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No businesses found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by creating your first business
          </Typography>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Add Business
          </Button>
        </Paper>
      )}

      {/* Enhanced Add/Edit Business Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingBusiness ? 'Edit Business' : 'Add New Business'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Basic Information" />
                <Tab label="Contact & Social" />
                <Tab label="Logo Images" />
              </Tabs>
            </Box>

            {/* Tab 0: Basic Information */}
            {tabValue === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="business_name"
                    label="Business Name"
                    value={formData.business_name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="legal_business_name"
                    label="Legal Business Name"
                    value={formData.legal_business_name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    helperText="Describe your business, its history, and what makes it unique"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="primary_title"
                    label="Primary Title"
                    value={formData.primary_title}
                    onChange={handleChange}
                    fullWidth
                    helperText="e.g., Owner, Founder, CEO"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="job_title"
                    label="Job Title"
                    value={formData.job_title}
                    onChange={handleChange}
                    fullWidth
                    helperText="e.g., Head Winemaker, Master Vintner"
                  />
                </Grid>
              </Grid>
            )}

            {/* Tab 1: Contact & Social */}
            {tabValue === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="business_email"
                    label="Business Email"
                    type="email"
                    value={formData.business_email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="phone_number"
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="website_url"
                    label="Website URL"
                    value={formData.website_url}
                    onChange={handleChange}
                    fullWidth
                    helperText="Include https:// at the beginning"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Social Media Links</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="instagram_url"
                    label="Instagram URL"
                    value={formData.instagram_url}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <Instagram sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="facebook_url"
                    label="Facebook URL"
                    value={formData.facebook_url}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <Facebook sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="linkedin_url"
                    label="LinkedIn URL"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <LinkedIn sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="yelp_url"
                    label="Yelp URL"
                    value={formData.yelp_url}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <RateReview sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {/* Tab 2: Logo Images */}
            {tabValue === 2 && (
              <Box>
                <ImageUpload
                  images={formData.logo_images}
                  onImagesChange={(images) => setFormData({ ...formData, logo_images: images })}
                  maxImages={3}
                  label="Business Logo Images"
                  helperText="Upload your business logo and additional branding images (max 3)"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingBusiness ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default BusinessManagement; 