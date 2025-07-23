import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  ImageList,
  ImageListItem,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  ArrowBack,
  AttachMoney,
  AccessTime,
  Restaurant,
  LocalBar,
  Close,
  LocationOn,
  Group,
} from '@mui/icons-material';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { websiteExperiencesAPI, websiteBookingsAPI, handleWebsiteApiError } from '../../services/websiteApi';
import { useWebsiteAuth } from '../../contexts/WebsiteAuthContext';

const WebsiteExperienceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useWebsiteAuth();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: null,
    time: '',
    party_size: 1,
    special_requests: '',
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadExperienceDetails();
  }, [id]);

  const loadExperienceDetails = async () => {
    try {
      setLoading(true);
      const response = await websiteExperiencesAPI.getExperienceById(id);
      const experienceData = response.data.data?.experience;
      console.log('Experience Data:', experienceData);
      console.log('Time Slots:', experienceData?.time_slots);
      setExperience(experienceData);
    } catch (error) {
      setError(handleWebsiteApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBookingOpen = () => {
    if (!user) {
      navigate('/website/login', { state: { from: `/website/experiences/${id}` } });
      return;
    }
    setBookingDialogOpen(true);
  };

  const handleBookingClose = () => {
    setBookingDialogOpen(false);
    setBookingError('');
    setBookingData({
      date: null,
      time: '',
      party_size: 1,
      special_requests: '',
    });
  };

  const handleBookingChange = (field) => (event) => {
    const value = event?.target?.value ?? event;
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
    setBookingError('');
  };

  const getAvailableTimeSlots = () => {
    console.log('Getting available time slots...');
    console.log('Experience:', experience);
    console.log('Selected Date:', bookingData.date);
    console.log('Time Slots:', experience?.time_slots);

    if (!experience || !bookingData.date || !Array.isArray(experience.time_slots)) {
      console.log('No experience, date, or time slots array');
      return [];
    }

    // Get all available time slots
    const availableSlots = experience.time_slots.filter(slot => slot.is_available);
    console.log('Available Slots:', availableSlots);

    // If no slots available, return empty array
    if (availableSlots.length === 0) {
      console.log('No available slots');
      return [];
    }

    const dayOfWeek = format(bookingData.date, 'EEEE').toLowerCase();
    const operationHours = experience.outlet?.operation_hours?.[dayOfWeek];
    console.log('Day of Week:', dayOfWeek);
    console.log('Operation Hours:', operationHours);

    // If no operation hours are set, show all available slots
    if (!operationHours) {
      console.log('No operation hours, returning all available slots');
      return availableSlots;
    }

    // If outlet is closed on this day, return no slots
    if (operationHours.is_closed) {
      console.log('Outlet is closed on this day');
      return [];
    }

    // Return all available time slots that are within operation hours
    console.log('Returning filtered available slots');
    return availableSlots;
  };

  const handleBookingSubmit = async () => {
    try {
      setBookingLoading(true);
      setBookingError('');

      // Validate date
      if (!bookingData.date || !(bookingData.date instanceof Date) || isNaN(bookingData.date)) {
        setBookingError('Please select a valid date');
        return;
      }

      // Format date as YYYY-MM-DD
      const formattedDate = format(bookingData.date, 'yyyy-MM-dd');

      const response = await websiteBookingsAPI.createBooking({
        experience_id: experience.id,
        booking_date: formattedDate,
        booking_time: bookingData.time,
        party_size: bookingData.party_size,
        special_requests: bookingData.special_requests,
      });

      handleBookingClose();
      navigate('/website/bookings');
    } catch (error) {
      setBookingError(handleWebsiteApiError(error));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#722F37' }} />
      </Box>
    );
  }

  if (error || !experience) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Experience not found'}
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

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/website/outlets/${experience.outlet.id}`)}
        sx={{ mb: 3 }}
      >
        Back to Outlet
      </Button>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Images and Details */}
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
            {experience.images && experience.images.length > 0 ? (
              <Box
                component="img"
                src={experience.images[0]}
                alt={experience.title}
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
          {experience.images && experience.images.length > 1 && (
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
              {experience.images.map((img, index) => (
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
                    alt={`${experience.title} - ${index + 1}`}
                    loading="lazy"
                    style={{ height: '100%', objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {/* Experience Details */}
          <Typography variant="h4" component="h1" gutterBottom>
            {experience.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn color="action" sx={{ mr: 1 }} />
            <Typography variant="body1">
              {experience.outlet.outlet_name} - {experience.outlet.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AttachMoney color="action" sx={{ mr: 1 }} />
            <Typography variant="h6">
              ${experience.price_per_person} per person
            </Typography>
          </Box>

          {experience.description && (
            <Typography variant="body1" paragraph>
              {experience.description}
            </Typography>
          )}

          {/* Menu Items */}
          {experience.menu_item_title && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Menu Details
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {experience.menu_item_title}
              </Typography>
              {experience.menu_item_description && (
                <Typography variant="body1" color="text.secondary">
                  {experience.menu_item_description}
                </Typography>
              )}
            </Paper>
          )}
        </Grid>

        {/* Right Column - Booking Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom>
              Book This Experience
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Price per Person
              </Typography>
              <Typography variant="h5" color="primary">
                ${experience.price_per_person}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleBookingOpen}
              sx={{
                backgroundColor: '#722F37',
                '&:hover': { backgroundColor: '#5D252B' },
              }}
            >
              Book Now
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Time Slots Summary */}
            <Typography variant="subtitle2" gutterBottom>
              Available Time Slots
            </Typography>
            <Box sx={{ mb: 2 }}>
              {Array.isArray(experience.time_slots) && experience.time_slots.some(slot => slot.is_available) ? (
                experience.time_slots
                  .filter(slot => slot.is_available)
                  .map((slot, index) => (
                    <Chip
                      key={index}
                      label={`${slot.start_time} - ${slot.end_time}`}
                      size="small"
                      icon={<AccessTime />}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No time slots available
                </Typography>
              )}
            </Box>

            {/* Max Party Size */}
            <Typography variant="subtitle2" gutterBottom>
              Maximum Party Size
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                icon={<Group />}
                label={`Up to ${Math.max(...experience.time_slots.map(slot => slot.max_party_size))} guests`}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={handleBookingClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Book Experience
          <IconButton
            onClick={handleBookingClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {bookingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookingError}
            </Alert>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={bookingData.date}
              onChange={handleBookingChange('date')}
              minDate={addDays(new Date(), 1)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  onError: () => {
                    setBookingError('Please select a valid date');
                  },
                },
              }}
            />
          </LocalizationProvider>

          <FormControl fullWidth margin="normal">
            <InputLabel>Time Slot</InputLabel>
            <Select
              value={bookingData.time}
              label="Time Slot"
              onChange={handleBookingChange('time')}
              disabled={!bookingData.date}
            >
              {availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((slot, index) => (
                  <MenuItem key={index} value={slot.start_time}>
                    {slot.start_time} - {slot.end_time} (Max {slot.max_party_size} guests)
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  {!bookingData.date ? 'Select a date first' : 'No time slots available for this date'}
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Party Size</InputLabel>
            <Select
              value={bookingData.party_size}
              label="Party Size"
              onChange={handleBookingChange('party_size')}
            >
              {[...Array(10)].map((_, i) => (
                <MenuItem key={i} value={i + 1}>
                  {i + 1} {i === 0 ? 'person' : 'people'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Special Requests"
            multiline
            rows={3}
            value={bookingData.special_requests}
            onChange={handleBookingChange('special_requests')}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Total Price
            </Typography>
            <Typography variant="h5" color="primary">
              ${experience.price_per_person * bookingData.party_size}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBookingSubmit}
            disabled={
              bookingLoading ||
              !bookingData.date ||
              !bookingData.time ||
              !bookingData.party_size
            }
            sx={{
              backgroundColor: '#722F37',
              '&:hover': { backgroundColor: '#5D252B' },
            }}
          >
            {bookingLoading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default WebsiteExperienceDetails; 