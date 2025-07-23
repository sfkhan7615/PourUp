import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Add,
  Delete,
  Schedule,
  People,
} from '@mui/icons-material';

const TimeSlotManager = ({
  value = [],
  onChange,
  disabled = false,
  error = false,
  helperText = '',
}) => {
  const defaultSlot = {
    start_time: '10:00',
    end_time: '11:00',
    max_party_size: 8,
    is_available: true,
  };

  const addTimeSlot = () => {
    onChange([...value, { ...defaultSlot }]);
  };

  const removeTimeSlot = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, newValue) => {
    const updatedSlots = value.map((slot, i) =>
      i === index ? { ...slot, [field]: newValue } : slot
    );
    onChange(updatedSlots);
  };

  const duplicateTimeSlot = (index) => {
    const slotToDuplicate = value[index];
    const duplicatedSlot = { ...slotToDuplicate };
    const newSlots = [...value];
    newSlots.splice(index + 1, 0, duplicatedSlot);
    onChange(newSlots);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Schedule color="action" />
        <Typography variant="h6">Time Slots</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={addTimeSlot}
          disabled={disabled}
          sx={{ ml: 'auto' }}
        >
          Add Slot
        </Button>
      </Box>

      {value.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
          <Schedule sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No time slots configured
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add time slots to allow customers to book this experience
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={addTimeSlot}
            disabled={disabled}
          >
            Add First Slot
          </Button>
        </Paper>
      )}

      {value.map((slot, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Slot {index + 1}
              {slot.start_time && slot.end_time && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({formatTime(slot.start_time)} - {formatTime(slot.end_time)})
                </Typography>
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => duplicateTimeSlot(index)}
                disabled={disabled}
              >
                Duplicate
              </Button>
              <IconButton
                size="small"
                color="error"
                onClick={() => removeTimeSlot(index)}
                disabled={disabled || value.length === 1}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Start Time"
                type="time"
                value={slot.start_time || ''}
                onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                fullWidth
                size="small"
                disabled={disabled}
                error={error}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 minute intervals
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="End Time"
                type="time"
                value={slot.end_time || ''}
                onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                fullWidth
                size="small"
                disabled={disabled}
                error={error}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 minute intervals
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Max Party Size"
                type="number"
                value={slot.max_party_size || ''}
                onChange={(e) => updateTimeSlot(index, 'max_party_size', parseInt(e.target.value) || 0)}
                fullWidth
                size="small"
                disabled={disabled}
                error={error}
                InputProps={{
                  startAdornment: <People sx={{ mr: 1, color: 'action.active' }} />,
                }}
                inputProps={{
                  min: 1,
                  max: 100,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={slot.is_available || false}
                    onChange={(e) => updateTimeSlot(index, 'is_available', e.target.checked)}
                    disabled={disabled}
                    size="small"
                  />
                }
                label="Available"
                sx={{ height: '100%', m: 0, display: 'flex', alignItems: 'center' }}
              />
            </Grid>
          </Grid>

          {/* Duration and Capacity Summary */}
          {slot.start_time && slot.end_time && (
            <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Duration: {(() => {
                  const start = new Date(`2000-01-01T${slot.start_time}:00`);
                  const end = new Date(`2000-01-01T${slot.end_time}:00`);
                  const diffMinutes = (end - start) / (1000 * 60);
                  const hours = Math.floor(diffMinutes / 60);
                  const minutes = diffMinutes % 60;
                  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                })()}
                {slot.max_party_size && (
                  <>
                    {' • '}
                    Capacity: {slot.max_party_size} {slot.max_party_size === 1 ? 'person' : 'people'}
                  </>
                )}
                {' • '}
                Status: {slot.is_available ? 'Available' : 'Unavailable'}
              </Typography>
            </Box>
          )}

          {index < value.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Paper>
      ))}

      {/* Quick Actions */}
      {value.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const standardSlots = [
                { start_time: '10:00', end_time: '12:00', max_party_size: 8, is_available: true },
                { start_time: '14:00', end_time: '16:00', max_party_size: 8, is_available: true },
                { start_time: '17:00', end_time: '19:00', max_party_size: 6, is_available: true },
              ];
              onChange(standardSlots);
            }}
            disabled={disabled}
          >
            Set Standard Slots
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const updatedSlots = value.map(slot => ({ ...slot, is_available: true }));
              onChange(updatedSlots);
            }}
            disabled={disabled}
          >
            Enable All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const updatedSlots = value.map(slot => ({ ...slot, is_available: false }));
              onChange(updatedSlots);
            }}
            disabled={disabled}
          >
            Disable All
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => onChange([])}
            disabled={disabled}
          >
            Clear All
          </Button>
        </Box>
      )}

      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default TimeSlotManager; 