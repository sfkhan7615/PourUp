import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Button,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Search,
  Store as StoreIcon,
  LocationOn,
  Schedule,
  Instagram,
  Facebook,
  LinkedIn,
  Terrain,
  LocalBar,
  FilterList,
  Image as ImageIcon,
} from '@mui/icons-material';
import { outletAPI, handleApiError } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PublicOutlets = () => {
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Get unique values for filters
  const businessTypes = [...new Set(outlets.flatMap(outlet => outlet.business_types || []))];
  const locations = [...new Set(outlets.map(outlet => outlet.ava_location).filter(Boolean))];

  useEffect(() => {
    loadOutlets();
  }, []);

  useEffect(() => {
    filterOutlets();
  }, [outlets, searchTerm, businessTypeFilter, locationFilter]);

  const loadOutlets = async () => {
    try {
      const response = await outletAPI.getOutlets();
      setOutlets(response.data.data?.outlets || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const filterOutlets = () => {
    let filtered = outlets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(outlet =>
        outlet.outlet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.ava_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.business?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.amenities?.some(amenity => amenity.toLowerCase().includes(searchTerm.toLowerCase())) ||
        outlet.atmosphere?.some(atmosphere => atmosphere.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Business type filter
    if (businessTypeFilter) {
      filtered = filtered.filter(outlet =>
        outlet.business_types?.includes(businessTypeFilter)
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(outlet =>
        outlet.ava_location === locationFilter
      );
    }

    setFilteredOutlets(filtered);
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'instagram': return <Instagram fontSize="small" />;
      case 'facebook': return <Facebook fontSize="small" />;
      case 'linkedin': return <LinkedIn fontSize="small" />;
      default: return null;
    }
  };

  const formatOperationHours = (operationHours) => {
    if (!operationHours || Object.keys(operationHours).length === 0) {
      return 'Hours not specified';
    }

    const today = new Date().getDay();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = daysOfWeek[today];
    const todayHours = operationHours[todayKey];

    if (!todayHours) return 'Hours not available';
    if (todayHours.is_closed) return 'Closed today';

    return `Today: ${todayHours.start_time} - ${todayHours.end_time}`;
  };

  const handleViewExperiences = (outletId) => {
    // Navigate to experiences for this outlet
    window.location.href = `/public/experiences?outlet=${outletId}`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setBusinessTypeFilter('');
    setLocationFilter('');
  };

  if (loading) {
    return <LoadingSpinner message="Loading outlets..." />;
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Explore Winery Locations
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Discover tasting rooms, vineyards, and unique wine experiences
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, location, amenities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Business Type</InputLabel>
              <Select
                value={businessTypeFilter}
                onChange={(e) => setBusinessTypeFilter(e.target.value)}
                label="Business Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {businessTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>AVA Region</InputLabel>
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                label="AVA Region"
              >
                <MenuItem value="">All Regions</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {(searchTerm || businessTypeFilter || locationFilter) && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredOutlets.length} of {outlets.length} locations shown
            </Typography>
            <Button
              startIcon={<FilterList />}
              onClick={clearFilters}
              size="small"
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* Outlets Grid */}
      <Grid container spacing={4}>
        {filteredOutlets.map((outlet) => (
          <Grid item xs={12} md={6} lg={4} key={outlet.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              {/* Outlet Header with Images */}
              <Box sx={{ position: 'relative' }}>
                {outlet.images && outlet.images.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={outlet.images[0]}
                    alt={outlet.outlet_name}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'grey.100',
                    }}
                  >
                    <StoreIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                  </Box>
                )}

                {/* Image Count Badge */}
                {outlet.images && outlet.images.length > 1 && (
                  <Badge
                    badgeContent={outlet.images.length}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      '& .MuiBadge-badge': {
                        fontSize: '0.75rem',
                        height: 20,
                        minWidth: 20,
                      },
                    }}
                  >
                    <ImageIcon sx={{ color: 'white' }} />
                  </Badge>
                )}

                {/* Business Type Chips */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 8, 
                  left: 8, 
                  display: 'flex', 
                  gap: 0.5, 
                  flexWrap: 'wrap',
                  maxWidth: 'calc(100% - 16px)'
                }}>
                  {outlet.business_types && outlet.business_types.slice(0, 2).map((type) => (
                    <Chip
                      key={type}
                      label={type.replace(/_/g, ' ')}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.75rem',
                        height: 24,
                      }}
                    />
                  ))}
                  {outlet.business_types && outlet.business_types.length > 2 && (
                    <Chip
                      label={`+${outlet.business_types.length - 2}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.75rem',
                        height: 24,
                      }}
                    />
                  )}
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {outlet.outlet_name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {outlet.business?.business_name}
                </Typography>

                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">
                    {outlet.location}
                  </Typography>
                </Box>

                {/* AVA Location */}
                {outlet.ava_location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Terrain fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {outlet.ava_location}
                    </Typography>
                  </Box>
                )}

                {/* Operation Hours */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatOperationHours(outlet.operation_hours)}
                  </Typography>
                </Box>

                {/* Amenities Preview */}
                {outlet.amenities && outlet.amenities.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      Amenities:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {outlet.amenities.slice(0, 3).map(amenity => amenity.replace(/_/g, ' ')).join(', ')}
                      {outlet.amenities.length > 3 && ` +${outlet.amenities.length - 3} more`}
                    </Typography>
                  </Box>
                )}

                {/* Atmosphere */}
                {outlet.atmosphere && outlet.atmosphere.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      Atmosphere:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {outlet.atmosphere.slice(0, 2).map(atm => atm.replace(/_/g, ' ')).join(', ')}
                      {outlet.atmosphere.length > 2 && ` +${outlet.atmosphere.length - 2} more`}
                    </Typography>
                  </Box>
                )}

                                 {/* Wine Production */}
                 {outlet.wine_production && outlet.wine_production.length > 0 && (
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                     <LocalBar fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {outlet.wine_production.slice(0, 2).map(prod => prod.replace(/_/g, ' ')).join(', ')}
                      {outlet.wine_production.length > 2 && ` +${outlet.wine_production.length - 2} more`}
                    </Typography>
                  </Box>
                )}

                {/* Social Media */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto', justifyContent: 'center' }}>
                  {outlet.instagram_url && (
                    <Tooltip title="Follow on Instagram">
                      <IconButton
                        component="a"
                        href={outlet.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ 
                          backgroundColor: 'action.hover',
                          '&:hover': { backgroundColor: 'primary.light' }
                        }}
                      >
                        {getSocialIcon('instagram')}
                      </IconButton>
                    </Tooltip>
                  )}
                  {outlet.facebook_url && (
                    <Tooltip title="Follow on Facebook">
                      <IconButton
                        component="a"
                        href={outlet.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ 
                          backgroundColor: 'action.hover',
                          '&:hover': { backgroundColor: 'primary.light' }
                        }}
                      >
                        {getSocialIcon('facebook')}
                      </IconButton>
                    </Tooltip>
                  )}
                  {outlet.linkedin_url && (
                    <Tooltip title="Connect on LinkedIn">
                      <IconButton
                        component="a"
                        href={outlet.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ 
                          backgroundColor: 'action.hover',
                          '&:hover': { backgroundColor: 'primary.light' }
                        }}
                      >
                        {getSocialIcon('linkedin')}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleViewExperiences(outlet.id)}
                  fullWidth
                  sx={{ mx: 2 }}
                >
                  View Experiences
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredOutlets.length === 0 && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <StoreIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No outlets found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || businessTypeFilter || locationFilter
              ? `Try adjusting your search or filter criteria`
              : 'Check back later for new locations and experiences'
            }
          </Typography>
          {(searchTerm || businessTypeFilter || locationFilter) && (
            <Button 
              variant="outlined" 
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default PublicOutlets; 