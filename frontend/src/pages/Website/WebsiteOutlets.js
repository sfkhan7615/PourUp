import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Pagination,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  LocationOn,
  AttachMoney,
  LocalBar,
  Restaurant,
  Clear,
} from '@mui/icons-material';
import { websiteOutletsAPI, handleWebsiteApiError } from '../../services/websiteApi';
import { useWebsiteAuth } from '../../contexts/WebsiteAuthContext';

const WebsiteOutlets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useWebsiteAuth();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: new URLSearchParams(location.search).get('search') || '',
    location: user?.location || '',
    business_type: '',
  });

  useEffect(() => {
    loadOutlets();
  }, [page, filters]);

  const loadOutlets = async () => {
    try {
      setLoading(true);
      const response = await websiteOutletsAPI.getOutlets({
        page,
        limit: 12,
        ...filters,
      });
      setOutlets(response.data.data?.outlets || []);
      setTotalPages(response.data.data?.pagination?.pages || 1);
    } catch (error) {
      handleWebsiteApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: '',
      business_type: '',
    });
    setPage(1);
    navigate('/website/outlets');
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Discover Outlets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find and explore amazing wineries, vineyards, and tasting rooms
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search Outlets"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Business Type</InputLabel>
              <Select
                value={filters.business_type}
                label="Business Type"
                onChange={(e) => handleFilterChange('business_type', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="winery">Winery</MenuItem>
                <MenuItem value="vineyard">Vineyard</MenuItem>
                <MenuItem value="tasting_room">Tasting Room</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<Clear />}
              disabled={!filters.search && !filters.location && !filters.business_type}
            >
              Clear All
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#722F37' }} />
        </Box>
      ) : (
        <>
          {outlets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No outlets found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your filters or search criteria
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {outlets.map((outlet) => (
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
                          image={outlet.images[0]}
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
                        <Typography variant="h6" component="h2" gutterBottom>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#722F37',
                      },
                      '& .Mui-selected': {
                        backgroundColor: '#722F37 !important',
                        color: 'white',
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default WebsiteOutlets; 