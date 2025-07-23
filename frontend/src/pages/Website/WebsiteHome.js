import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  LocationOn,
  AttachMoney,
  LocalBar,
  Restaurant,
  Event,
  Star,
} from '@mui/icons-material';
import { websiteOutletsAPI, handleWebsiteApiError } from '../../services/websiteApi';

const WebsiteHome = () => {
  const navigate = useNavigate();
  const [featuredOutlets, setFeaturedOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFeaturedOutlets();
  }, []);

  const loadFeaturedOutlets = async () => {
    try {
      setLoading(true);
      const response = await websiteOutletsAPI.getOutlets({ limit: 6 });
      setFeaturedOutlets(response.data.data?.outlets || []);
    } catch (error) {
      handleWebsiteApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigate(`/website/outlets${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #722F37 0%, #C7B377 100%)',
          color: 'white',
          py: { xs: 6, md: 12 },
          mb: 6,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.75rem' }
            }}
          >
            Discover Amazing Wine Experiences
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              opacity: 0.9,
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}
          >
            Book unique tastings, tours, and experiences at the finest wineries
          </Typography>

          {/* Search Bar */}
          <Box sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
            <Paper sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search for wineries, locations, experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  sx: { border: 'none', '& fieldset': { border: 'none' } }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleSearch}
                sx={{ 
                  ml: 1, 
                  backgroundColor: '#722F37',
                  '&:hover': { backgroundColor: '#5D252B' }
                }}
              >
                Search
              </Button>
            </Paper>
          </Box>

          {/* Quick Actions */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center" 
            sx={{ mt: 3 }}
          >
            <Button 
              variant="outlined" 
              startIcon={<LocalBar />}
              onClick={() => navigate('/website/outlets')}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Browse All Outlets
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Event />}
              onClick={() => navigate('/website/outlets')}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Find Experiences
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Why Choose PourUp?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <LocalBar sx={{ fontSize: 64, color: '#722F37', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Curated Experiences
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover hand-picked wineries and unique tasting experiences from local experts.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Event sx={{ fontSize: 64, color: '#722F37', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Easy Booking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Book your wine experiences instantly with real-time availability and confirmation.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Star sx={{ fontSize: 64, color: '#722F37', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Premium Quality
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Experience the finest wines and hospitality at top-rated wineries and vineyards.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Outlets */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Outlets
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explore some of our most popular wineries and tasting rooms
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#722F37' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featuredOutlets.map((outlet) => (
              <Grid item xs={12} sm={6} md={4} key={outlet.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                  onClick={() => navigate(`/website/outlets/${outlet.id}`)}
                >
                  {outlet.images && outlet.images.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={Array.isArray(outlet.images) ? outlet.images[0] : outlet.images}
                      alt={outlet.outlet_name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <LocalBar sx={{ fontSize: 64, color: '#722F37' }} />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {outlet.outlet_name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {outlet.location}
                      </Typography>
                    </Box>

                    {outlet.business_types && outlet.business_types.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        {outlet.business_types.slice(0, 2).map((type, index) => (
                          <Chip
                            key={index}
                            label={type.replace('_', ' ')}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}

                    {outlet.experiences && outlet.experiences.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Restaurant fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {outlet.experiences.length} experience{outlet.experiences.length !== 1 ? 's' : ''} available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      sx={{ backgroundColor: '#722F37', '&:hover': { backgroundColor: '#5D252B' } }}
                    >
                      View Details
                    </Button>
                    {outlet.experiences && outlet.experiences.length > 0 && (
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          From ${Math.min(...outlet.experiences.map(exp => exp.price_per_person))}
                        </Typography>
                      </Box>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {featuredOutlets.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/website/outlets')}
              sx={{ 
                borderColor: '#722F37', 
                color: '#722F37',
                '&:hover': { backgroundColor: 'rgba(114, 47, 55, 0.1)' }
              }}
            >
              View All Outlets
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default WebsiteHome; 