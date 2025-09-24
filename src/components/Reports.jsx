import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assessment as ReportsIcon,
  AccountBalance as CompaniesIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import Layout from './Layout';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const drawerWidth = 240;

function Reports() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({
    companies: [],
    subscriptions: [],
    revenue: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);

  // Initialize with mock data for now
  useEffect(() => {
    // Mock data - replace with real Firestore data when ready
    const mockData = {
      companies: [
        { id: '1', name: 'Tech Corp', industry: 'Technology', createdAt: new Date() },
        { id: '2', name: 'Design Studio', industry: 'Design', createdAt: new Date() },
        { id: '3', name: 'Marketing Inc', industry: 'Marketing', createdAt: new Date() },
      ],
      subscriptions: [
        { id: '1', monthlyAmount: 299, status: 'active' },
        { id: '2', monthlyAmount: 499, status: 'active' },
        { id: '3', monthlyAmount: 199, status: 'active' },
      ],
      revenue: {
        currentMonth: 997,
        lastMonth: 897,
        growth: 11.2
      },
      activity: [
        { id: '1', description: 'New company signed up: Tech Corp', timestamp: new Date() },
        { id: '2', description: 'Monthly payment received from Design Studio', timestamp: new Date(Date.now() - 3600000) },
        { id: '3', description: 'Support ticket resolved', timestamp: new Date(Date.now() - 7200000) },
      ]
    };

    setReportData(mockData);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const exportReport = () => {
    // Simple CSV export
    const csvData = [
      ['Report Type', 'Value', 'Date'],
      ['Total Companies', reportData.companies.length, new Date().toLocaleDateString()],
      ['Active Subscriptions', reportData.subscriptions.filter(s => s.status === 'active').length, new Date().toLocaleDateString()],
      ['Monthly Revenue', `$${reportData.revenue.currentMonth}`, new Date().toLocaleDateString()],
      ['Revenue Growth', `${reportData.revenue.growth.toFixed(1)}%`, new Date().toLocaleDateString()],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>

        <Container maxWidth="xl" sx={{ mt: 1, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Reports & Analytics
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportReport}
              sx={{ borderRadius: 2 }}
            >
              Export Report
            </Button>
          </Box>

          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                    <CompaniesIcon />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {reportData.companies.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Companies
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    ${reportData.revenue.currentMonth.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    {reportData.revenue.growth >= 0 ? (
                      <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} />
                    )}
                    <Typography
                      variant="caption"
                      color={reportData.revenue.growth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {reportData.revenue.growth >= 0 ? '+' : ''}{reportData.revenue.growth.toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {reportData.subscriptions.filter(s => s.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Subscriptions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {reportData.companies.filter(c => c.createdAt && new Date(c.createdAt).getMonth() === new Date().getMonth()).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Companies (This Month)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Companies Table */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Recent Companies
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Industry</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Date Added</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.companies.slice(0, 5).map((company) => (
                          <TableRow key={company.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main', fontSize: 12 }}>
                                  {company.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                {company.name}
                              </Box>
                            </TableCell>
                            <TableCell>{company.industry}</TableCell>
                            <TableCell>
                              {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Revenue Breakdown
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {reportData.subscriptions.filter(s => s.status === 'active').slice(0, 5).map((subscription, index) => (
                      <Box key={subscription.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: index < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Typography variant="body2">
                          Company {index + 1}
                        </Typography>
                        <Chip
                          label={`$${subscription.monthlyAmount || 0}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                    {reportData.subscriptions.filter(s => s.status === 'active').length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <MoneyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          No active subscriptions yet
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Activity Log */}
          <Card sx={{ borderRadius: 3, mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {reportData.activity.length > 0 ? (
                  reportData.activity.map((activity, index) => (
                    <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', py: 1.5, borderBottom: index < reportData.activity.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                        <ReportsIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">{activity.description || activity.action}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ReportsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No recent activity to display
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Layout>
  );
}

export default Reports;
