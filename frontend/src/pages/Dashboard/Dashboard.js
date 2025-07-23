import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import {
  Business,
  Store,
  Event,
  People,
  PendingActions,
  TrendingUp,
  Assignment,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { businessAPI, outletAPI, experienceAPI, userAPI } from '../../services/api';

const Dashboard = () => {
  const { user, isSuperAdmin, isWineryAdmin, isOutletManager } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isSuperAdmin) {
        await loadSuperAdminData();
      } else if (isWineryAdmin) {
        await loadWineryAdminData();
      } else if (isOutletManager) {
        await loadOutletManagerData();
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuperAdminData = async () => {
    const [usersResponse, businessesResponse, outletsResponse, experiencesResponse, pendingResponse] = await Promise.all([
      userAPI.getUsers({ page: 1, limit: 1 }),
      businessAPI.getBusinesses({ page: 1, limit: 1 }),
      outletAPI.getOutlets({ page: 1, limit: 1 }),
      experienceAPI.getExperiences({ page: 1, limit: 1 }),
      businessAPI.getPendingBusinesses(),
    ]);

    setStats({
      totalUsers: usersResponse.data.data?.pagination?.total || 0,
      totalBusinesses: businessesResponse.data.data?.pagination?.total || 0,
      totalOutlets: outletsResponse.data.data?.pagination?.total || 0,
      totalExperiences: experiencesResponse.data.data?.pagination?.total || 0,
    });

    setPendingBusinesses(pendingResponse.data.data?.businesses || []);
  };

  const loadWineryAdminData = async () => {
    const [businessesResponse, outletsResponse] = await Promise.all([
      businessAPI.getMyBusinesses(),
      outletAPI.getMyOutlets(),
    ]);

    setStats({
      myBusinesses: businessesResponse.data.data?.businesses?.length || 0,
      myOutlets: outletsResponse.data.data?.outlets?.length || 0,
      approvedBusinesses: businessesResponse.data.data?.businesses?.filter(b => b.approval_status === 'approved').length || 0,
    });
  };

  const loadOutletManagerData = async () => {
    const [outletsResponse, experiencesResponse] = await Promise.all([
      outletAPI.getAssignedOutlets(),
      experienceAPI.getMyExperiences(),
    ]);

    setStats({
      assignedOutlets: outletsResponse.data.data?.outlets?.length || 0,
      myExperiences: experiencesResponse.data.data?.experiences?.length || 0,
    });
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
          <Avatar sx={{ backgroundColor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSuperAdminDashboard = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Super Admin Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Businesses"
            value={stats.totalBusinesses}
            icon={<Business />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Outlets"
            value={stats.totalOutlets}
            icon={<Store />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Experiences"
            value={stats.totalExperiences}
            icon={<Event />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Pending Approvals */}
      {pendingBusinesses.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <PendingActions sx={{ mr: 1, verticalAlign: 'middle' }} />
            Pending Business Approvals ({pendingBusinesses.length})
          </Typography>
          <List>
            {pendingBusinesses.slice(0, 5).map((business) => (
              <ListItem key={business.id}>
                <ListItemIcon>
                  <Business />
                </ListItemIcon>
                <ListItemText
                  primary={business.business_name}
                  secondary={business.business_email}
                />
                <Chip label="Pending" color="warning" size="small" />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" href="/public/businesses" sx={{ mt: 2 }}>
            Review All
          </Button>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" href="/users">
            Manage Users
          </Button>
          <Button variant="outlined" href="/businesses">
            Manage Businesses
          </Button>
          <Button variant="outlined" href="/outlets">
            Manage Outlets
          </Button>
          <Button variant="outlined" href="/experiences">
            Manage Experiences
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  const renderWineryAdminDashboard = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Winery Admin Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="My Businesses"
            value={stats.myBusinesses}
            icon={<Business />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Approved Businesses"
            value={stats.approvedBusinesses}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="My Outlets"
            value={stats.myOutlets}
            icon={<Store />}
            color="secondary"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" href="/businesses">
            Manage Businesses
          </Button>
          <Button variant="outlined" href="/outlets">
            Manage Outlets
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  const renderOutletManagerDashboard = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Outlet Manager Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Assigned Outlets"
            value={stats.assignedOutlets}
            icon={<Store />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="My Experiences"
            value={stats.myExperiences}
            icon={<Event />}
            color="secondary"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Your Role
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          As an Outlet Manager, you can create and manage experiences for your assigned outlets.
          You have access to manage time slots, pricing, and experience details.
        </Typography>
        <Button variant="contained" href="/experiences">
          Manage Experiences
        </Button>
      </Paper>
    </Box>
  );

  const renderUserDashboard = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to PourUp
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Explore Wineries & Experiences
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Discover amazing wineries, outlets, and unique experiences in your area.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" href="/public/businesses">
            Browse Businesses
          </Button>
          <Button variant="outlined" href="/public/outlets">
            Find Outlets
          </Button>
          <Button variant="outlined" href="/public/experiences">
            Book Experiences
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  const renderWelcomeSection = () => (
    <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #722F37 0%, #C7B377 100%)', color: 'white' }}>
      <Typography variant="h5" gutterBottom>
        Welcome back, {user?.first_name}!
      </Typography>
      <Typography variant="body1">
        {isSuperAdmin && 'You have full system access as a Super Administrator.'}
        {isWineryAdmin && 'Manage your winery businesses and outlets from here.'}
        {isOutletManager && 'Create and manage experiences for your assigned outlets.'}
        {!isSuperAdmin && !isWineryAdmin && !isOutletManager && 'Explore amazing winery experiences.'}
      </Typography>
    </Paper>
  );

  return (
    <Box>
      {renderWelcomeSection()}
      
      {isSuperAdmin && renderSuperAdminDashboard()}
      {isWineryAdmin && renderWineryAdminDashboard()}
      {isOutletManager && renderOutletManagerDashboard()}
      {!isSuperAdmin && !isWineryAdmin && !isOutletManager && renderUserDashboard()}
    </Box>
  );
};

export default Dashboard; 