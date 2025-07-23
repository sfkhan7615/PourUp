import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Preview,
  Add,
  Close,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  },
  label = 'Upload Images',
  helperText = 'Drag & drop images here, or click to select files',
  disabled = false
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    setError('');
    setUploading(true);

    try {
      // Check if adding these files would exceed the limit
      if (images.length + acceptedFiles.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        setUploading(false);
        return;
      }

      const newImages = [];
      
      for (const file of acceptedFiles) {
        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB`);
          continue;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // In a real application, you would upload to a server here
        // For now, we'll just use the preview URL and file name
        newImages.push({
          id: Date.now() + Math.random(),
          file: file,
          url: previewUrl,
          name: file.name,
          size: file.size,
          uploaded: false // In real app, set to true after successful upload
        });
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      setError('Failed to process images');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, maxSizeMB, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true,
    disabled: disabled || uploading,
    maxFiles: maxImages - images.length,
  });

  const removeImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.url) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    onImagesChange(images.filter(img => img.id !== imageId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>

      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease-in-out',
          mb: 2,
          textAlign: 'center',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop images here...' : helperText}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {images.length}/{maxImages} images • Max {maxSizeMB}MB each
        </Typography>
        <Button
          variant="outlined"
          disabled={disabled || uploading || images.length >= maxImages}
          startIcon={uploading ? <CircularProgress size={20} /> : <Add />}
        >
          {uploading ? 'Processing...' : 'Select Images'}
        </Button>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image) => (
            <Grid item xs={6} sm={4} md={3} key={image.id}>
              <Paper
                sx={{
                  position: 'relative',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  '&:hover .image-actions': {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  component="img"
                  src={image.url}
                  alt={image.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Image Actions Overlay */}
                <Box
                  className="image-actions"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    opacity: 0,
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ color: 'white' }}
                    onClick={() => setPreviewImage(image)}
                  >
                    <Preview />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ color: 'white' }}
                    onClick={() => removeImage(image.id)}
                    disabled={disabled}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                {/* Upload Status */}
                {!image.uploaded && (
                  <Chip
                    label="Processing"
                    size="small"
                    color="warning"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                    }}
                  />
                )}

                {/* File Info */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    p: 1,
                  }}
                >
                  <Typography variant="caption" noWrap>
                    {image.name}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {formatFileSize(image.size)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Image Preview
            <IconButton onClick={() => setPreviewImage(null)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={previewImage.url}
                alt={previewImage.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                }}
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                {previewImage.name} • {formatFileSize(previewImage.size)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewImage(null)}>Close</Button>
          <Button
            color="error"
            onClick={() => {
              removeImage(previewImage.id);
              setPreviewImage(null);
            }}
            disabled={disabled}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload; 