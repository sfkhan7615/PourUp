import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { bookingsAPI, handleApiError } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
  rejected: 'error',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const BookingManagement = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    outlet_id: '',
    date_from: null,
    date_to: null,
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBookings();
  }, [page, filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...filters,
        date_from: filters.date_from ? format(filters.date_from, 'yyyy-MM-dd') : '',
        date_to: filters.date_to ? format(filters.date_to, 'yyyy-MM-dd') : '',
      });

      const response = await bookingsAPI.getBookings(queryParams);
      setBookings(response.data.data?.bookings || []);
      setTotalPages(response.data.data?.pagination?.pages || 1);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    const value = event?.target?.value ?? event;
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(1);
  };

  const handleViewDetails = async (booking) => {
    try {
      const response = await bookingsAPI.getBookingById(booking.id);
      setSelectedBooking(response.data.data?.booking);
      setDetailsOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await bookingsAPI.updateBookingStatus(selectedBooking.id, {
        status: newStatus,
        notes,
      });

      setStatusDialogOpen(false);
      setNewStatus('');
      setNotes('');
      loadBookings();
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const openStatusDialog = (booking, status) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Bookings
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={handleFilterChange('status')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                value={filters.date_from}
                onChange={handleFilterChange('date_from')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="To Date"
                value={filters.date_to}
                onChange={handleFilterChange('date_to')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() =>
                setFilters({
                  status: '',
                  outlet_id: '',
                  date_from: null,
                  date_to: null,
                })
              }
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bookings Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Party Size</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.confirmation_code}</TableCell>
                <TableCell>
                  {booking.user.first_name} {booking.user.last_name}
                </TableCell>
                <TableCell>{booking.experience.title}</TableCell>
                <TableCell>
                  {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                  <br />
                  {booking.booking_time}
                </TableCell>
                <TableCell>{booking.party_size}</TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[booking.status]}
                    color={statusColors[booking.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(booking)}
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {booking.status === 'pending' && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => openStatusDialog(booking, 'confirmed')}
                        title="Confirm"
                        color="primary"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openStatusDialog(booking, 'rejected')}
                        title="Reject"
                        color="error"
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <IconButton
                      size="small"
                      onClick={() => openStatusDialog(booking, 'completed')}
                      title="Mark as Completed"
                      color="success"
                    >
                      <DoneIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Customer</Typography>
                <Typography gutterBottom>
                  {selectedBooking.user.first_name} {selectedBooking.user.last_name}
                  <br />
                  {selectedBooking.user.email}
                </Typography>

                <Typography variant="subtitle2">Experience</Typography>
                <Typography gutterBottom>
                  {selectedBooking.experience.title}
                  <br />
                  ${selectedBooking.experience.price_per_person} per person
                </Typography>

                <Typography variant="subtitle2">Outlet</Typography>
                <Typography gutterBottom>
                  {selectedBooking.outlet.outlet_name}
                  <br />
                  {selectedBooking.outlet.location}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Booking Details</Typography>
                <Typography gutterBottom>
                  Date: {format(new Date(selectedBooking.booking_date), 'MMMM d, yyyy')}
                  <br />
                  Time: {selectedBooking.booking_time}
                  <br />
                  Party Size: {selectedBooking.party_size}
                  <br />
                  Total Price: ${selectedBooking.total_price}
                </Typography>

                {selectedBooking.special_requests && (
                  <>
                    <Typography variant="subtitle2">Special Requests</Typography>
                    <Typography gutterBottom>
                      {selectedBooking.special_requests}
                    </Typography>
                  </>
                )}

                {selectedBooking.notes && (
                  <>
                    <Typography variant="subtitle2">Notes</Typography>
                    <Typography gutterBottom>{selectedBooking.notes}</Typography>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Booking Status to {statusLabels[newStatus]}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            color={
              newStatus === 'confirmed'
                ? 'primary'
                : newStatus === 'rejected'
                ? 'error'
                : 'success'
            }
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingManagement; 