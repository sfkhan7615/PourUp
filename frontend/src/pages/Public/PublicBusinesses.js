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
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Button,
  CardActions,
} from '@mui/material';
import {
  Search,
  Business as BusinessIcon,
  Phone,
  Email,
  Web,
  Instagram,
  Facebook,
  LinkedIn,
  RateReview,
  Work,
  Language,
} from '@mui/icons-material';
import { businessAPI, handleApiError } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PublicBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchTerm]);

  const loadBusinesses = async () => {
    try {
      const response = await businessAPI.getBusinesses({ status: 'pending' });
      setBusinesses(response.data.data?.businesses || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    if (!searchTerm) {
      setFilteredBusinesses(businesses);
      return;
    }

    const filtered = businesses.filter(business =>
      business.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.legal_business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.primary_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBusinesses(filtered);
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

  const handleViewOutlets = (businessId) => {
    // Navigate to outlets for this business
    window.location.href = `/public/outlets?business=${businessId}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading businesses..." />;
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Discover Wineries & Businesses
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Explore our curated collection of premium wineries and tasting experiences
        </Typography>
        
        {/* Search */}
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search wineries, businesses, or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                backgroundColor: 'background.paper',
              },
            }}
          />
        </Box>
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
          {searchTerm && ` for "${searchTerm}"`}
        </Typography>
      </Box>

      {/* Business Grid */}
      <Grid container spacing={4}>
        {filteredBusinesses.map((business) => (
          <Grid item xs={12} md={6} lg={4} key={business.id}>
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
              {/* Business Header with Logo */}
              <Box sx={{ position: 'relative' }}>
                {business.logo_images && business.logo_images.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={business.logo_images[0]}
                    alt={business.business_name}
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
                    <BusinessIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                  </Box>
                )}

                {/* Business Info Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                    p: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {business.business_name}
                  </Typography>
                  {business.legal_business_name !== business.business_name && (
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {business.legal_business_name}
                    </Typography>
                  )}
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                {/* Description */}
                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {business.description}
                </Typography>

                {/* Contact Information */}
                <Stack spacing={1}>
                  {business.business_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" component="a" href={`mailto:${business.business_email}`}>
                        {business.business_email}
                      </Typography>
                    </Box>
                  )}
                  
                  {business.phone_number && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" component="a" href={`tel:${business.phone_number}`}>
                        {business.phone_number}
                      </Typography>
                    </Box>
                  )}
                  
                  {business.website_url && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Web fontSize="small" color="action" />
                      <Typography variant="body2">
                        <a href={business.website_url} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Business Leadership */}
                {(business.primary_title || business.job_title) && (
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    {business.primary_title && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Work fontSize="small" color="action" />
                        <Typography variant="subtitle2">
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

                {/* Social Media */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                  {business.instagram_url && (
                    <Tooltip title="Follow on Instagram">
                      <IconButton
                        component="a"
                        href={business.instagram_url}
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
                  {business.facebook_url && (
                    <Tooltip title="Follow on Facebook">
                      <IconButton
                        component="a"
                        href={business.facebook_url}
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
                  {business.linkedin_url && (
                    <Tooltip title="Connect on LinkedIn">
                      <IconButton
                        component="a"
                        href={business.linkedin_url}
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
                  {business.yelp_url && (
                    <Tooltip title="Review on Yelp">
                      <IconButton
                        component="a"
                        href={business.yelp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ 
                          backgroundColor: 'action.hover',
                          '&:hover': { backgroundColor: 'primary.light' }
                        }}
                      >
                        {getSocialIcon('yelp')}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleViewOutlets(business.id)}
                  fullWidth
                  sx={{ mx: 2 }}
                >
                  View Locations & Experiences
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredBusinesses.length === 0 && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No businesses found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm 
              ? `Try adjusting your search terms or browse all businesses`
              : 'Check back later for new businesses and wineries'
            }
          </Typography>
          {searchTerm && (
            <Button 
              variant="outlined" 
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default PublicBusinesses; 