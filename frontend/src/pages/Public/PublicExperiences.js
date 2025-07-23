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
  Event as EventIcon,
  AttachMoney,
  Schedule,
  People,
  Restaurant,
  Store as StoreIcon,
  FilterList,
  Image as ImageIcon,
  Star,
  AccessTime,
} from '@mui/icons-material';
import { experienceAPI, handleApiError } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PublicExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState('');

  // Get unique values for filters
  const businessTypes = [...new Set(experiences.map(exp => exp.business_types).filter(Boolean))];
  const priceRanges = [
    { label: 'Under $25', value: '0-25' },
    { label: '$25 - $50', value: '25-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: 'Over $100', value: '100+' },
  ];

  useEffect(() => {
    loadExperiences();
  }, []);

  useEffect(() => {
    filterExperiences();
  }, [experiences, searchTerm, businessTypeFilter, priceRangeFilter]);

  const loadExperiences = async () => {
    try {
      const response = await experienceAPI.getExperiences();
      const experiencesData = response.data.data?.experiences || [];
      setExperiences(experiencesData);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const filterExperiences = () => {
    let filtered = experiences;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(experience =>
        experience.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.outlet?.outlet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.business_types?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.menu_item_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.menu_item_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Business type filter
    if (businessTypeFilter) {
      filtered = filtered.filter(experience =>
        experience.business_types === businessTypeFilter
      );
    }

    // Price range filter
    if (priceRangeFilter) {
      filtered = filtered.filter(experience => {
        const price = experience.price_per_person || 0;
        switch (priceRangeFilter) {
          case '0-25':
            return price < 25;
          case '25-50':
            return price >= 25 && price < 50;
          case '50-100':
            return price >= 50 && price < 100;
          case '100+':
            return price >= 100;
          default:
            return true;
        }
      });
    }

    setFilteredExperiences(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getTimeSlotSummary = (timeSlots) => {
    if (!timeSlots || timeSlots.length === 0) return 'No slots available';
    const activeSlots = timeSlots.filter(slot => slot.is_available);
    if (activeSlots.length === 0) return 'No available slots';
    return `${activeSlots.length} time slot${activeSlots.length !== 1 ? 's' : ''} available`;
  };

  const getDuration = (timeSlots) => {
    if (!timeSlots || timeSlots.length === 0) return null;
    const firstSlot = timeSlots[0];
    if (!firstSlot.start_time || !firstSlot.end_time) return null;
    
    const start = new Date(`2000-01-01T${firstSlot.start_time}:00`);
    const end = new Date(`2000-01-01T${firstSlot.end_time}:00`);
    const diffMinutes = (end - start) / (1000 * 60);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const handleBookExperience = (experienceId) => {
    // Handle booking logic
    alert(`Booking functionality for experience ${experienceId} would be implemented here`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setBusinessTypeFilter('');
    setPriceRangeFilter('');
  };

  if (loading) {
    return <LoadingSpinner message="Loading experiences..." />;
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Wine Experiences & Tastings
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Discover unique wine experiences, tastings, and culinary adventures
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search experiences, locations, wine types..."
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
              <InputLabel>Experience Type</InputLabel>
              <Select
                value={businessTypeFilter}
                onChange={(e) => setBusinessTypeFilter(e.target.value)}
                label="Experience Type"
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
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                label="Price Range"
              >
                <MenuItem value="">All Prices</MenuItem>
                {priceRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {(searchTerm || businessTypeFilter || priceRangeFilter) && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredExperiences.length} of {experiences.length} experiences shown
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

      {/* Experiences Grid */}
      <Grid container spacing={4}>
        {filteredExperiences.map((experience) => (
          <Grid item xs={12} md={6} lg={4} key={experience.id}>
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
              {/* Experience Header with Images */}
              <Box sx={{ position: 'relative' }}>
                {experience.images && experience.images.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={experience.images[0]}
                    alt={experience.title}
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
                    <EventIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                  </Box>
                )}

                {/* Image Count Badge */}
                {experience.images && experience.images.length > 1 && (
                  <Badge
                    badgeContent={experience.images.length}
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

                {/* Price Tag */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <AttachMoney fontSize="small" />
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(experience.price_per_person)}
                  </Typography>
                  <Typography variant="caption">
                    /person
                  </Typography>
                </Box>

                {/* Business Type Chip */}
                {experience.business_types && (
                  <Chip
                    label={experience.business_types.replace(/_/g, ' ')}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 'medium',
                    }}
                  />
                )}

                {/* Duration Badge */}
                {getDuration(experience.time_slots) && (
                  <Chip
                    icon={<AccessTime fontSize="small" />}
                    label={getDuration(experience.time_slots)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 'medium',
                    }}
                  />
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {experience.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StoreIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {experience.outlet?.outlet_name}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {experience.description}
                </Typography>

                {/* Time Slots Summary */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">
                    {getTimeSlotSummary(experience.time_slots)}
                  </Typography>
                </Box>

                {/* Menu Item */}
                {experience.menu_item_title && (
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: 'primary.light', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Restaurant fontSize="small" color="primary" />
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                        {experience.menu_item_title}
                      </Typography>
                    </Box>
                    {experience.menu_item_description && (
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {experience.menu_item_description}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Key Features */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {experience.time_slots && experience.time_slots.length > 0 && (
                    <Chip
                      icon={<People fontSize="small" />}
                      label={`Up to ${Math.max(...experience.time_slots.map(slot => slot.max_party_size || 0))} guests`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    icon={<Star fontSize="small" />}
                    label="Highly Rated"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => handleBookExperience(experience.id)}
                  fullWidth
                  sx={{ 
                    mx: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  }}
                >
                  Book Experience
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredExperiences.length === 0 && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No experiences found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || businessTypeFilter || priceRangeFilter
              ? `Try adjusting your search or filter criteria to discover amazing wine experiences`
              : 'Check back later for new wine experiences and tastings'
            }
          </Typography>
          {(searchTerm || businessTypeFilter || priceRangeFilter) && (
            <Button 
              variant="outlined" 
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          )}
        </Paper>
      )}

      {/* Call to Action for Business Owners */}
      {!loading && experiences.length > 0 && (
        <Paper 
          sx={{ 
            p: 4, 
            mt: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Own a Winery or Vineyard?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Showcase your unique experiences and reach more wine enthusiasts.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => window.location.href = '/login'}
            sx={{ px: 4, py: 1.5 }}
          >
            Join PourUp Today
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default PublicExperiences; 