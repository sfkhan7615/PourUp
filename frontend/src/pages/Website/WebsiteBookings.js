import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Pagination,
  Alert,
} from '@mui/material';
import {
  Event,
  LocationOn,
  AttachMoney,
  AccessTime,
  Cancel,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { websiteBookingsAPI, handleWebsiteApiError } from '../../services/websiteApi';

const statusColors = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'default',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const WebsiteBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTab, setSelectedTab] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [page, selectedTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await websiteBookingsAPI.getBookings({
        page,
        limit: 6,
        status: selectedTab === 'all' ? undefined : selectedTab,
      });
      setBookings(response.data.data?.bookings || []);
      setTotalPages(response.data.data?.pagination?.pages || 1);
    } catch (error) {
      setError(handleWebsiteApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      setCancelLoading(true);
      await websiteBookingsAPI.cancelBooking(selectedBooking.id);
      loadBookings(); // Reload bookings after cancellation
      setCancelDialogOpen(false);
    } catch (error) {
      handleWebsiteApiError(error);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  if (loading && page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#722F37' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
            },
            '& .Mui-selected': {
              color: '#722F37 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#722F37',
            },
          }}
        >
          <Tab label="All Bookings" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Confirmed" value="confirmed" />
          <Tab label="Completed" value="completed" />
          <Tab label="Cancelled" value="cancelled" />
        </Tabs>
      </Box>

      {/* Bookings Grid */}
      {bookings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/website/outlets')}
            sx={{
              mt: 2,
              backgroundColor: '#722F37',
              '&:hover': { backgroundColor: '#5D252B' },
            }}
          >
            Browse Experiences
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {bookings.map((booking) => (
              <Grid item xs={12} md={6} key={booking.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2">
                        {booking.experience.title}
                      </Typography>
                      <Chip
                        label={statusLabels[booking.status]}
                        color={statusColors[booking.status]}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {booking.outlet.outlet_name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Event fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {format(new Date(booking.booking_date), 'MMMM d, yyyy')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {booking.booking_time}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Total: ${booking.total_price} ({booking.party_size} {booking.party_size === 1 ? 'person' : 'people'})
                      </Typography>
                    </Box>

                    {booking.confirmation_code && (
                      <Typography variant="body2" color="text.secondary">
                        Confirmation Code: {booking.confirmation_code}
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/website/experiences/${booking.experience.id}`)}
                    >
                      View Experience
                    </Button>
                    {booking.status === 'confirmed' && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCancelClick(booking)}
                      >
                        Cancel Booking
                      </Button>
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

      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your booking for "{selectedBooking?.experience.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} disabled={cancelLoading}>
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            disabled={cancelLoading}
          >
            {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WebsiteBookings; 