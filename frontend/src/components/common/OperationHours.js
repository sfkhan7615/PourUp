import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import {
  Schedule,
  ContentCopy,
} from '@mui/icons-material';
import TimeInput from './TimeInput';

const OperationHours = ({
  value = {},
  onChange,
  disabled = false,
  error = false,
  helperText = '',
}) => {
  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const defaultHours = {
    start_time: '09:00',
    end_time: '17:00',
    is_closed: false,
  };

  const handleDayChange = (day, field, newValue) => {
    const updatedHours = {
      ...value,
      [day]: {
        ...value[day],
        [field]: newValue,
      },
    };
    onChange(updatedHours);
  };

  const copyHours = (sourceDay, targetDay) => {
    const sourceHours = value[sourceDay] || defaultHours;
    handleDayChange(targetDay, 'start_time', sourceHours.start_time);
    handleDayChange(targetDay, 'end_time', sourceHours.end_time);
    handleDayChange(targetDay, 'is_closed', sourceHours.is_closed);
  };

  const setStandardHours = () => {
    const standardWeekday = { start_time: '09:00', end_time: '17:00', is_closed: false };
    const standardWeekend = { start_time: '10:00', end_time: '16:00', is_closed: false };

    const updatedHours = {
      monday: standardWeekday,
      tuesday: standardWeekday,
      wednesday: standardWeekday,
      thursday: standardWeekday,
      friday: standardWeekday,
      saturday: standardWeekend,
      sunday: standardWeekend,
    };
    onChange(updatedHours);
  };

  const setAllClosed = () => {
    const updatedHours = {};
    daysOfWeek.forEach(({ key }) => {
      updatedHours[key] = { start_time: '', end_time: '', is_closed: true };
    });
    onChange(updatedHours);
  };

  const getDayHours = (day) => {
    return value[day] || defaultHours;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Schedule color="action" />
        <Typography variant="h6">Operation Hours</Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={setStandardHours}
          disabled={disabled}
        >
          Standard Hours
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={setAllClosed}
          disabled={disabled}
        >
          All Closed
        </Button>
      </Box>

      {/* Days Grid */}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {daysOfWeek.map(({ key, label }, index) => {
            const dayHours = getDayHours(key);
            
            return (
              <Grid item xs={12} md={6} key={key}>
                <Box sx={{ mb: index < daysOfWeek.length - 1 ? 2 : 0 }}>
                  <TimeInput
                    label={label}
                    startTime={dayHours.start_time}
                    endTime={dayHours.end_time}
                    isClosed={dayHours.is_closed}
                    onStartTimeChange={(time) => handleDayChange(key, 'start_time', time)}
                    onEndTimeChange={(time) => handleDayChange(key, 'end_time', time)}
                    onClosedChange={(closed) => handleDayChange(key, 'is_closed', closed)}
                    disabled={disabled}
                    error={error}
                  />

                  {/* Copy Hours Option */}
                  {!dayHours.is_closed && index > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      {daysOfWeek.slice(0, index).map(({ key: sourceKey, label: sourceLabel }) => {
                        const sourceHours = getDayHours(sourceKey);
                        if (sourceHours.is_closed) return null;
                        
                        return (
                          <Button
                            key={sourceKey}
                            variant="text"
                            size="small"
                            startIcon={<ContentCopy />}
                            onClick={() => copyHours(sourceKey, key)}
                            disabled={disabled}
                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            Copy {sourceLabel}
                          </Button>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                {index < daysOfWeek.length - 1 && index % 2 === 1 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                )}
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default OperationHours; 