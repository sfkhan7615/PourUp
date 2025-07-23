import React from 'react';
import {
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';

const TimeInput = ({
  label,
  startTime,
  endTime,
  isClosed = false,
  onStartTimeChange,
  onEndTimeChange,
  onClosedChange,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color={error ? 'error' : 'inherit'}>
          {label}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isClosed}
              onChange={(e) => onClosedChange(e.target.checked)}
              disabled={disabled}
              size="small"
            />
          }
          label="Closed"
          labelPlacement="start"
          sx={{ m: 0 }}
        />
      </Box>

      {!isClosed && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Start Time"
              type="time"
              value={startTime || ''}
              onChange={(e) => onStartTimeChange(e.target.value)}
              fullWidth
              size="small"
              disabled={disabled}
              required={required}
              error={error}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 minute intervals
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Time"
              type="time"
              value={endTime || ''}
              onChange={(e) => onEndTimeChange(e.target.value)}
              fullWidth
              size="small"
              disabled={disabled}
              required={required}
              error={error}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 minute intervals
              }}
            />
          </Grid>
        </Grid>
      )}

      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default TimeInput; 