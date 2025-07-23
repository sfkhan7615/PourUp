import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  AttachMoney,
  LocalBar,
  Restaurant,
  Close,
  Instagram,
  Facebook,
  LinkedIn,
} from '@mui/icons-material';
import { websiteOutletsAPI, handleWebsiteApiError } from '../../services/websiteApi';

const WebsiteOutletDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outlet, setOutlet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOutletDetails();
  }, [id]);

  const loadOutletDetails = async () => {
    try {
      setLoading(true);
      const response = await websiteOutletsAPI.getOutletById(id);
      setOutlet(response.data.data?.outlet);
    } catch (error) {
      setError(handleWebsiteApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const formatOperationHours = (hours) => {
    if (!hours) return 'Hours not available';
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.map(day => {
      const dayHours = hours[day];
      if (!dayHours || dayHours.is_closed) {
        return `${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`;
      }
      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours.start_time} - ${dayHours.end_time}`;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#722F37' }} />
      </Box>
    );
  }

  if (error || !outlet) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Outlet not found'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/website/outlets')}
            sx={{ mt: 2, backgroundColor: '#722F37', '&:hover': { backgroundColor: '#5D252B' } }}
          >
            Back to Outlets
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/website/outlets')}
        sx={{ mb: 3 }}
      >
        Back to Outlets
      </Button>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Images and Basic Info */}
        <Grid item xs={12} md={8}>
          {/* Main Image */}
          <Paper 
            elevation={2}
            sx={{ 
              position: 'relative',
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {outlet.images && outlet.images.length > 0 ? (
              <Box
                component="img"
                src={Array.isArray(outlet.images) ? outlet.images[0] : outlet.images}
                alt={outlet.outlet_name}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LocalBar sx={{ fontSize: 96, color: '#722F37' }} />
              </Box>
            )}
          </Paper>

          {/* Image Gallery */}
          {outlet.images && (Array.isArray(outlet.images) ? outlet.images.length > 1 : false) && (
            <ImageList
              sx={{ 
                width: '100%',
                height: 200,
                mb: 4,
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888',
                  borderRadius: 4,
                },
              }}
              cols={4}
              rowHeight={164}
            >
              {Array.isArray(outlet.images) && outlet.images.map((img, index) => (
                <ImageListItem 
                  key={index}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`${outlet.outlet_name} - ${index + 1}`}
                    loading="lazy"
                    style={{ height: '100%', objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {/* Description and Details */}
          <Typography variant="h4" component="h1" gutterBottom>
            {outlet.outlet_name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn color="action" sx={{ mr: 1 }} />
            <Typography variant="body1">
              {outlet.location}
            </Typography>
          </Box>

          {outlet.business?.description && (
            <Typography variant="body1" paragraph>
              {outlet.business.description}
            </Typography>
          )}

          {/* Business Types */}
          {outlet.business_types && outlet.business_types.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Business Types
              </Typography>
              <Box>
                {outlet.business_types.map((type, index) => (
                  <Chip
                    key={index}
                    label={type.replace('_', ' ')}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Features Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Amenities */}
            {outlet.amenities && outlet.amenities.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Amenities
                  </Typography>
                  <Box>
                    {outlet.amenities.map((amenity, index) => (
                      <Chip
                        key={index}
                        label={amenity}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Atmosphere */}
            {outlet.atmosphere && outlet.atmosphere.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Atmosphere
                  </Typography>
                  <Box>
                    {outlet.atmosphere.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Soil Type */}
            {outlet.soil_type && outlet.soil_type.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Soil Types
                  </Typography>
                  <Box>
                    {outlet.soil_type.map((type, index) => (
                      <Chip
                        key={index}
                        label={type}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Wine Production */}
            {outlet.wine_production && outlet.wine_production.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Wine Production
                  </Typography>
                  <Box>
                    {outlet.wine_production.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Right Column - Hours, Contact, Experiences */}
        <Grid item xs={12} md={4}>
          {/* Operation Hours */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Operation Hours
            </Typography>
            {outlet.operation_hours ? (
              formatOperationHours(outlet.operation_hours).map((hours, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  {hours}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Hours not available
              </Typography>
            )}
          </Paper>

          {/* Social Links */}
          {(outlet.instagram_url || outlet.facebook_url || outlet.linkedin_url) && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Connect With Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {outlet.instagram_url && (
                  <Link href={outlet.instagram_url} target="_blank" rel="noopener noreferrer">
                    <IconButton color="primary">
                      <Instagram />
                    </IconButton>
                  </Link>
                )}
                {outlet.facebook_url && (
                  <Link href={outlet.facebook_url} target="_blank" rel="noopener noreferrer">
                    <IconButton color="primary">
                      <Facebook />
                    </IconButton>
                  </Link>
                )}
                {outlet.linkedin_url && (
                  <Link href={outlet.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <IconButton color="primary">
                      <LinkedIn />
                    </IconButton>
                  </Link>
                )}
              </Box>
            </Paper>
          )}

          {/* Experiences */}
          {outlet.experiences && outlet.experiences.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Available Experiences
              </Typography>
              {outlet.experiences.map((experience) => (
                <Card key={experience.id} sx={{ mb: 2 }}>
                  {experience.images && experience.images.length > 0 && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={experience.images[0]}
                      alt={experience.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {experience.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney sx={{ mr: 0.5 }} />
                      <Typography variant="body1">
                        ${experience.price_per_person} per person
                      </Typography>
                    </Box>
                    {experience.description && (
                      <Typography variant="body2" color="text.secondary">
                        {experience.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => navigate(`/website/experiences/${experience.id}`)}
                      sx={{ backgroundColor: '#722F37', '&:hover': { backgroundColor: '#5D252B' } }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Image Viewer Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <Close />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Enlarged view"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default WebsiteOutletDetails; 