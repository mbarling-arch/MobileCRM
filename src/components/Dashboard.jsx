import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Avatar, Container, Fab } from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  AccountBalance as CompaniesIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import Layout from './Layout';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import StatCard from './ui/StatCard';
import Panel from './ui/Panel';

function Dashboard() {
  const { logout, currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    totalCompanies: 0,
    churnRate: 0,
    newSignups: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from Firestore
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch companies (customers using our software)
        const companiesQuery = query(collection(db, 'companies'));
        const companiesSnapshot = await getDocs(companiesQuery);
        const companiesCount = companiesSnapshot.size;

        // Remove subscriptions and revenue for now
        const activeSubscriptions = 0;
        const totalRevenue = 0;
        const monthlyRevenue = 0;

        // Fetch new signups this month (support Date or Firestore Timestamp)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newSignups = companiesSnapshot.docs.filter(d => {
          const company = d.data();
          const created = company.createdAt;
          if (!created) return false;
          const createdDate = typeof created?.toDate === 'function' ? created.toDate() : (created instanceof Date ? created : null);
          if (!createdDate) return false;
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        // Calculate churn rate (simplified)
        const churnRate = Math.floor(Math.random() * 5); // Mock data for now

        setStats({
          totalRevenue,
          monthlyRevenue,
          activeSubscriptions,
          totalCompanies: companiesCount,
          churnRate,
          newSignups
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => { try { await logout(); } catch (error) { console.error('Failed to log out', error); } };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>

        {/* Welcome Section */}
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
          <Panel sx={{ mb: 3, background: 'linear-gradient(135deg, #242037 0%, #1e1a2d 100%)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                {currentUser?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Welcome back!
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
              Welcome to your admin portal. Monitor your business metrics, manage companies, and track growth.
            </Typography>
          </Panel>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Companies" value={loading ? '...' : stats.totalCompanies} icon={<BusinessIcon />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Monthly Revenue" value={loading ? '...' : `$${stats.monthlyRevenue.toLocaleString()}`} icon={<TrendingUpIcon />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Subscriptions" value={loading ? '...' : stats.activeSubscriptions} icon={<CompaniesIcon />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Churn Rate" value={loading ? '...' : `${stats.churnRate}%`} icon={<TrendingUpIcon />} />
            </Grid>
          </Grid>

          {/* Main Content Grid (activity and quick actions removed) */}
          <Grid container spacing={3}></Grid>
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          aria-label="add"
        >
          <AddIcon />
        </Fab>
      </Box>
    </Layout>
  );
}

export default Dashboard;
