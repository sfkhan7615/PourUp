import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Person,
  Logout,
  Settings,
  BookOnline,
  Home,
  Store,
} from '@mui/icons-material';
import { useWebsiteAuth } from '../../contexts/WebsiteAuthContext';

const WebsiteLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useWebsiteAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    navigate('/website');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Website Header */}
      <AppBar position="static" sx={{ backgroundColor: '#722F37' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo and Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => navigate('/website')}
              >
                🍷 PourUp
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <Button 
                  color="inherit" 
                  startIcon={<Home />}
                  onClick={() => navigate('/website')}
                  sx={{ 
                    fontWeight: isActive('/website') ? 'bold' : 'normal',
                    backgroundColor: isActive('/website') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  Home
                </Button>
                <Button 
                  color="inherit" 
                  startIcon={<Store />}
                  onClick={() => navigate('/website/outlets')}
                  sx={{ 
                    fontWeight: isActive('/website/outlets') ? 'bold' : 'normal',
                    backgroundColor: isActive('/website/outlets') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  Outlets
                </Button>
              </Stack>
            </Box>

            {/* User Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user ? (
                <>
                  <Button 
                    color="inherit" 
                    startIcon={<BookOnline />}
                    onClick={() => navigate('/website/bookings')}
                    sx={{ 
                      fontWeight: isActive('/website/bookings') ? 'bold' : 'normal',
                      backgroundColor: isActive('/website/bookings') ? 'rgba(255,255,255,0.1)' : 'transparent'
                    }}
                  >
                    My Bookings
                  </Button>
                  
                  <IconButton 
                    color="inherit" 
                    onClick={handleProfileMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      {user.first_name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>

                  {/* Profile Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    onClick={handleProfileMenuClose}
                  >
                    <MenuItem onClick={() => navigate('/website/settings')}>
                      <Settings sx={{ mr: 2 }} />
                      Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Logout sx={{ mr: 2 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/website/login')}
                    variant="outlined"
                    sx={{ borderColor: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                  >
                    Login
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/website/signup')}
                    variant="contained"
                    sx={{ backgroundColor: '#C7B377', '&:hover': { backgroundColor: '#B8A366' } }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Container>

      {/* Website Footer */}
      <Box 
        component="footer" 
        sx={{ 
          backgroundColor: '#722F37', 
          color: 'white', 
          py: 3, 
          mt: 'auto' 
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              🍷 PourUp
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Discover amazing wineries, book unique experiences
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.6)" sx={{ mt: 1 }}>
              © 2024 PourUp. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default WebsiteLayout; 