import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Box,
  OutlinedInput,
} from '@mui/material';

const MultiSelectField = ({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = 'Select options',
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  renderChips = true,
  maxChips = 3,
  ...props
}) => {
  const handleChange = (event) => {
    const selectedValues = event.target.value;
    onChange(typeof selectedValues === 'string' ? selectedValues.split(',') : selectedValues);
  };

  const renderValue = (selected) => {
    if (selected.length === 0) {
      return placeholder;
    }

    if (renderChips) {
      const visibleChips = selected.slice(0, maxChips);
      const remainingCount = selected.length - maxChips;

      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {visibleChips.map((value) => (
            <Chip
              key={value}
              label={value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              size="small"
              sx={{ height: 24 }}
            />
          ))}
          {remainingCount > 0 && (
            <Chip
              label={`+${remainingCount} more`}
              size="small"
              variant="outlined"
              sx={{ height: 24 }}
            />
          )}
        </Box>
      );
    }

    return selected.map(value => value.replace(/_/g, ' ')).join(', ');
  };

  return (
    <FormControl fullWidth error={error} disabled={disabled} required={required} {...props}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={renderValue}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option.replace(/_/g, ' ') : option.label;
          
          return (
            <MenuItem key={optionValue} value={optionValue}>
              <Checkbox checked={value.indexOf(optionValue) > -1} />
              <ListItemText primary={optionLabel} />
            </MenuItem>
          );
        })}
      </Select>
      {helperText && (
        <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: error ? 'error.main' : 'text.secondary' }}>
          {helperText}
        </Box>
      )}
    </FormControl>
  );
};

export default MultiSelectField; 