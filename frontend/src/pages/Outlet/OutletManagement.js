import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  Paper,
  Alert,
  Menu,
  Badge
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Store,
  LocationOn,
  Schedule,
  Business,
  Person,
  MoreVert,
  People,
  Email,
  Phone,
  Cake,
  PersonAdd,
  PersonRemove
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { outletAPI, businessAPI, userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';
import MultiSelectField from '../../components/common/MultiSelectField';
import OperationHours from '../../components/common/OperationHours';
import OutletManagerForm from '../../components/forms/OutletManagerForm';
import { toast } from 'react-toastify';

const BUSINESS_TYPES = ['winery', 'vineyard', 'tasting_room'];
const AMENITIES = ['Parking', 'Restaurant', 'Gift Shop', 'Tours', 'Outdoor Seating', 'Pet Friendly', 'Wheelchair Accessible'];
const ATMOSPHERE = ['Casual', 'Upscale', 'Family Friendly', 'Romantic', 'Historic', 'Modern'];
const SOIL_TYPES = ['Clay', 'Sandy', 'Loam', 'Volcanic', 'Limestone', 'Granite'];
const OWNERSHIP = ['Family Owned', 'Corporate', 'Cooperative', 'Estate'];
const WINE_PRODUCTION = ['Red Wine', 'White Wine', 'Rosé', 'Sparkling', 'Dessert Wine', 'Fortified Wine'];

// Business type display mapping
const BUSINESS_TYPE_LABELS = {
  'winery': 'Winery',
  'vineyard': 'Vineyard', 
  'tasting_room': 'Tasting Room'
};

// Helper function to get display label
const getBusinessTypeLabel = (type) => {
  return BUSINESS_TYPE_LABELS[type] || type;
};

const OutletManagement = () => {
  const { user, isSuperAdmin, isWineryAdmin, isOutletManager } = useAuth();
  const [outlets, setOutlets] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openManagerDialog, setOpenManagerDialog] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [outletManagers, setOutletManagers] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedOutletForMenu, setSelectedOutletForMenu] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load outlets based on user role
      let outletsResponse;
      if (isSuperAdmin) {
        outletsResponse = await outletAPI.getOutlets();
      } else if (isWineryAdmin) {
        outletsResponse = await outletAPI.getMyOutlets();
      } else if (isOutletManager) {
        outletsResponse = await outletAPI.getAssignedOutlets();
      }

      const outletsData = outletsResponse.data.data?.outlets || [];
      setOutlets(outletsData);

      // Load businesses for winery admins and super admins
      if (isWineryAdmin) {
        const businessesResponse = await businessAPI.getMyBusinesses();
        setBusinesses(businessesResponse.data.data?.businesses || []);
      } else if (isSuperAdmin) {
        const businessesResponse = await businessAPI.getBusinesses();
        setBusinesses(businessesResponse.data.data?.businesses || []);
      }

      // Load outlet managers for each outlet
      await loadOutletManagers(outletsData);

    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load outlets');
    } finally {
      setLoading(false);
    }
  };

  const loadOutletManagers = async (outletsData) => {
    try {
      const managersData = {};
      
      for (const outlet of outletsData) {
        try {
          const response = await userAPI.getOutletManagers(outlet.id);
          managersData[outlet.id] = response.data.data?.managers || [];
        } catch (error) {
          // If no managers found, set empty array
          managersData[outlet.id] = [];
        }
      }
      
      setOutletManagers(managersData);
    } catch (error) {
      console.error('Failed to load outlet managers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      business_id: '',
      outlet_name: '',
      location: '',
      ava_location: '',
      instagram_url: '',
      facebook_url: '',
      linkedin_url: '',
      business_types: [],
      operation_hours: {},
      amenities: [],
      atmosphere: [],
      soil_types: [],
      ownership: [],
      wine_production: [],
      images: []
    });
    setSelectedTab(0);
  };

  const handleAdd = () => {
    setSelectedOutlet(null);
    resetForm();
    setOpenDialog(true);
  };

  const handleEdit = (outlet) => {
    setSelectedOutlet(outlet);
    setFormData({
      business_id: outlet.business_id || '',
      outlet_name: outlet.outlet_name || '',
      location: outlet.location || '',
      ava_location: outlet.ava_location || '',
      instagram_url: outlet.instagram_url || '',
      facebook_url: outlet.facebook_url || '',
      linkedin_url: outlet.linkedin_url || '',
      business_types: outlet.business_types || [],
      operation_hours: outlet.operation_hours || {},
      amenities: outlet.amenities || [],
      atmosphere: outlet.atmosphere || [],
      soil_types: outlet.soil_types || [],
      ownership: outlet.ownership || [],
      wine_production: outlet.wine_production || [],
      images: outlet.images || []
    });
    setSelectedTab(0);
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Convert image objects to URLs for API
      const submitData = {
        ...formData,
        images: formData.images.map(img => img.url || img),
      };
      
      if (selectedOutlet) {
        await outletAPI.updateOutlet(selectedOutlet.id, submitData);
        toast.success('Outlet updated successfully!');
      } else {
        await outletAPI.createOutlet(submitData);
        toast.success('Outlet created successfully!');
      }
      
      setOpenDialog(false);
      loadData();
    } catch (error) {
      console.error('Failed to save outlet:', error);
      toast.error(error.response?.data?.message || 'Failed to save outlet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (outlet) => {
    if (window.confirm(`Are you sure you want to delete "${outlet.outlet_name}"?`)) {
      try {
        await outletAPI.deleteOutlet(outlet.id);
        toast.success('Outlet deleted successfully!');
        loadData();
      } catch (error) {
        console.error('Failed to delete outlet:', error);
        toast.error('Failed to delete outlet');
      }
    }
  };

  const handleAddManager = (outlet) => {
    setSelectedOutletForMenu(outlet);
    setOpenManagerDialog(true);
    setMenuAnchor(null);
  };

  const handleRemoveManager = async (outletId, manager) => {
    if (window.confirm(`Are you sure you want to remove ${manager.manager.first_name} ${manager.manager.last_name} as manager of this outlet?`)) {
      try {
        await userAPI.removeOutletManager(outletId, manager.manager.id);
        toast.success('Outlet manager removed successfully!');
        loadData();
      } catch (error) {
        console.error('Failed to remove outlet manager:', error);
        toast.error('Failed to remove outlet manager');
      }
    }
  };

  const handleManagerSuccess = () => {
    loadData();
  };

  const handleMenuOpen = (event, outlet) => {
    setMenuAnchor(event.currentTarget);
    setSelectedOutletForMenu(outlet);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedOutletForMenu(null);
  };

  const getManagerCount = (outletId) => {
    return outletManagers[outletId]?.length || 0;
  };

  // Check if current outlet manager can edit this outlet
  const canEditOutlet = (outlet) => {
    if (isSuperAdmin || isWineryAdmin) return true;
    if (isOutletManager) {
      // Check if this outlet manager is assigned to this outlet
      return outlet.outletManagements?.some(
        management => management.manager.id === user?.id && management.is_active
      );
    }
    return false;
  };

  // Get editable fields based on user role
  const getEditableFields = () => {
    if (isSuperAdmin || isWineryAdmin) {
      return ['all'];
    }
    if (isOutletManager) {
      return [
        'outlet_name',
        'location',
        'ava_location',
        'instagram_url',
        'facebook_url',
        'linkedin_url',
        'operation_hours',
        'amenities',
        'atmosphere',
        'images'
      ];
    }
    return [];
  };

  // Filter form tabs based on user role
  const getAvailableTabs = () => {
    const allTabs = [
      { label: 'Basic Information', index: 0 },
      { label: 'Social Media', index: 1 },
      { label: 'Business Details', index: 2 },
      { label: 'Operation Hours', index: 3 },
      { label: 'Images', index: 4 }
    ];

    if (isSuperAdmin || isWineryAdmin) {
      return allTabs;
    }

    if (isOutletManager) {
      return allTabs.filter(tab => 
        tab.index !== 2 // Remove Business Details tab for outlet managers
      );
    }

    return [];
  };

  if (loading) {
    return <LoadingSpinner message="Loading outlets..." />;
  }

  // Debug info to help troubleshoot
  console.log('OutletManagement Debug:', {
    loading,
    isSuperAdmin,
    isWineryAdmin,
    outletsCount: outlets.length,
    userRole: user?.role
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Debug Panel - Remove this after testing */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
          <Typography variant="h6">🔧 Debug Info (Remove after testing)</Typography>
          <Typography variant="body2">Page: Outlet Management</Typography>
          <Typography variant="body2">Loading: {loading ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">Is Super Admin: {isSuperAdmin ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">Is Winery Admin: {isWineryAdmin ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">Outlets Count: {outlets.length}</Typography>
          <Typography variant="body2">User Role: {user?.role}</Typography>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Outlet Management</Typography>
          {(isSuperAdmin || isWineryAdmin) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{
                backgroundColor: 'success.main',
                '&:hover': { backgroundColor: 'success.dark' }
              }}
            >
              🏪 ADD OUTLET 🏪
            </Button>
          )}
        </Box>

        {outlets.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No outlets found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {isWineryAdmin ? 'Start by creating your first outlet.' : 'No outlets have been created yet.'}
            </Typography>
            {(isSuperAdmin || isWineryAdmin) && (
              <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
                Create Outlet
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {outlets.map((outlet) => (
              <Grid item xs={12} md={6} lg={4} key={outlet.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        {outlet.outlet_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge badgeContent={getManagerCount(outlet.id)} color="primary">
                          <People fontSize="small" />
                        </Badge>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, outlet)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOn fontSize="small" />
                        {outlet.location}
                      </Typography>
                      {outlet.ava_location && (
                        <Typography variant="body2" color="text.secondary">
                          AVA: {outlet.ava_location}
                        </Typography>
                      )}
                    </Box>

                    {outlet.business_types && outlet.business_types.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {outlet.business_types.map((type, index) => (
                          <Chip
                            key={index}
                            label={getBusinessTypeLabel(type)}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Operation Hours Summary */}
                    {outlet.operation_hours && Object.keys(outlet.operation_hours).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" />
                          Operation Hours Available
                        </Typography>
                      </Box>
                    )}

                    {/* Outlet Managers */}
                    {getManagerCount(outlet.id) > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Managers ({getManagerCount(outlet.id)}):
                        </Typography>
                        {outletManagers[outlet.id]?.slice(0, 2).map((managerData, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {managerData.manager.first_name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {managerData.manager.first_name} {managerData.manager.last_name}
                            </Typography>
                          </Box>
                        ))}
                        {getManagerCount(outlet.id) > 2 && (
                          <Typography variant="body2" color="text.secondary">
                            +{getManagerCount(outlet.id) - 2} more
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Outlet Images */}
                    {outlet.images && outlet.images.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Images: {outlet.images.length}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    {canEditOutlet(outlet) && (
                      <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(outlet)}>
                        Edit
                      </Button>
                    )}
                    {(isSuperAdmin || isWineryAdmin) && (
                      <Button size="small" startIcon={<Delete />} color="error" onClick={() => handleDelete(outlet)}>
                        Delete
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Actions Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleAddManager(selectedOutletForMenu)}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Add Manager" />
          </MenuItem>
          {getManagerCount(selectedOutletForMenu?.id) > 0 && (
            <MenuItem onClick={() => {
              // Show managers list in a simple dialog
              setMenuAnchor(null);
            }}>
              <ListItemIcon>
                <People fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="View Managers" />
            </MenuItem>
          )}
        </Menu>

        {/* Outlet Manager Creation Dialog */}
        <OutletManagerForm
          open={openManagerDialog}
          onClose={() => setOpenManagerDialog(false)}
          onSuccess={handleManagerSuccess}
        />

        {/* Outlet Form Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            {selectedOutlet ? 'Edit Outlet' : 'Add New Outlet'}
          </DialogTitle>
          
          <form onSubmit={handleSubmit}>
            <DialogContent dividers>
              <Tabs 
                value={selectedTab} 
                onChange={(e, newValue) => setSelectedTab(newValue)} 
                sx={{ mb: 3 }}
              >
                {getAvailableTabs().map(tab => (
                  <Tab key={tab.index} label={tab.label} />
                ))}
              </Tabs>

              {/* Tab 0: Basic Information */}
              {selectedTab === 0 && (
                <Grid container spacing={3}>
                  {/* Business Selection - Only for super admin and winery admin */}
                  {(isWineryAdmin || isSuperAdmin) && (
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Select Business</InputLabel>
                        <Select
                          value={formData.business_id}
                          onChange={(e) => setFormData({ ...formData, business_id: e.target.value })}
                          label="Select Business"
                        >
                          {businesses.map((business) => (
                            <MenuItem key={business.id} value={business.id}>
                              {business.business_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {/* Other basic information fields */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Outlet Name"
                      value={formData.outlet_name}
                      onChange={(e) => setFormData({ ...formData, outlet_name: e.target.value })}
                      placeholder="e.g., Downtown Tasting Room"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Street address, City, State"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="AVA Location"
                      value={formData.ava_location}
                      onChange={(e) => setFormData({ ...formData, ava_location: e.target.value })}
                      placeholder="American Viticultural Area"
                      helperText="Optional: Specify the AVA region"
                    />
                  </Grid>

                  {/* Business Types - Only for super admin and winery admin */}
                  {(isWineryAdmin || isSuperAdmin) && (
                    <Grid item xs={12}>
                      <MultiSelectField
                        label="Business Type"
                        value={formData.business_types}
                        onChange={(values) => setFormData({ ...formData, business_types: values })}
                        options={BUSINESS_TYPES}
                        helperText="Select all types that apply to this outlet"
                      />
                    </Grid>
                  )}
                </Grid>
              )}

              {/* Tab 1: Social Media */}
              {selectedTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Social Media Links
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Add your social media links to help customers connect with your outlet.
                    </Typography>
                  </Grid>

                  {/* Instagram URL */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Instagram URL"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/yourbusiness"
                      type="url"
                    />
                  </Grid>

                  {/* Facebook URL */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Facebook URL"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/yourbusiness"
                      type="url"
                    />
                  </Grid>

                  {/* LinkedIn URL */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="LinkedIn URL"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/company/yourbusiness"
                      type="url"
                    />
                  </Grid>
                </Grid>
              )}

              {/* Tab 2: Business Details */}
              {selectedTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Business Characteristics
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Describe the unique features and characteristics of your outlet.
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MultiSelectField
                      label="Amenities"
                      value={formData.amenities}
                      onChange={(values) => setFormData({ ...formData, amenities: values })}
                      options={AMENITIES}
                      helperText="Available facilities and services"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MultiSelectField
                      label="Atmosphere"
                      value={formData.atmosphere}
                      onChange={(values) => setFormData({ ...formData, atmosphere: values })}
                      options={ATMOSPHERE}
                      helperText="Describe the ambiance and feel"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MultiSelectField
                      label="Soil Type"
                      value={formData.soil_types}
                      onChange={(values) => setFormData({ ...formData, soil_types: values })}
                      options={SOIL_TYPES}
                      helperText="Types of soil in the vineyard"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MultiSelectField
                      label="Ownership"
                      value={formData.ownership}
                      onChange={(values) => setFormData({ ...formData, ownership: values })}
                      options={OWNERSHIP}
                      helperText="Ownership structure"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MultiSelectField
                      label="Wine Production"
                      value={formData.wine_production}
                      onChange={(values) => setFormData({ ...formData, wine_production: values })}
                      options={WINE_PRODUCTION}
                      helperText="Wine production methods and practices"
                    />
                  </Grid>
                </Grid>
              )}

              {/* Tab 3: Operation Hours */}
              {selectedTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Operation Hours
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Set your outlet's operating hours for each day of the week.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <OperationHours
                      value={formData.operation_hours}
                      onChange={(hours) => setFormData({ ...formData, operation_hours: hours })}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Tab 4: Images */}
              {selectedTab === 4 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Outlet Images
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Upload photos of your outlet, including exterior, interior, vineyard views, etc.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) => setFormData({ ...formData, images: images })}
                      maxImages={10}
                    />
                  </Grid>
                </Grid>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Saving...' : (selectedOutlet ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default OutletManagement; 