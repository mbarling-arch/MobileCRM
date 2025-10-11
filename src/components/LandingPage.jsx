import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  Chip,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const features = [
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Lead Management',
      description: 'Capture, track, and nurture leads through every stage of your sales pipeline with intelligent automation.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Deal Tracking',
      description: 'Monitor deals from initial contact to closing with comprehensive deal management and forecasting tools.'
    },
    {
      icon: <HomeIcon sx={{ fontSize: 40 }} />,
      title: 'Inventory Control',
      description: 'Real-time inventory management for manufactured homes with pricing, availability, and specifications.'
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      title: 'Document Management',
      description: 'Store, organize, and share documents securely with automated workflows and e-signature integration.'
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      title: 'Analytics & Reports',
      description: 'Powerful insights and customizable reports to track performance and make data-driven decisions.'
    },
    {
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-Location Support',
      description: 'Manage multiple dealership locations from a single platform with location-specific settings and users.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Dealerships' },
    { value: '50,000+', label: 'Homes Sold' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <HomeIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Mobile CRM
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              {isMdUp && (
                <>
                  <Button sx={{ color: 'text.primary' }}>Features</Button>
                  <Button sx={{ color: 'text.primary' }}>Pricing</Button>
                  <Button sx={{ color: 'text.primary' }}>Contact</Button>
                </>
              )}
              <Button variant="outlined" onClick={() => navigate('/login')} sx={{ color: 'primary.main', borderColor: 'primary.main' }}>
                Login
              </Button>
              <Button variant="contained" onClick={() => navigate('/login')}>
                Get Started
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 16 }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="Modern CRM for Modern Dealers"
                color="primary"
                sx={{ mb: 3, fontWeight: 600 }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.75rem' },
                  fontWeight: 800,
                  mb: 3,
                  lineHeight: 1.2,
                  color: 'text.primary',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                The Complete CRM for Manufactured Home Dealers
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, lineHeight: 1.6, color: 'text.secondary', fontWeight: 400 }}>
                Streamline your sales process, manage inventory, and close more deals with the #1 CRM built specifically for the manufactured housing industry.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4091 100%)'
                    }
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ py: 1.5, px: 4, fontSize: '1.1rem', fontWeight: 600 }}
                >
                  Watch Demo
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  position: 'relative'
                }}
              >
                <Grid container spacing={3}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            mb: 1
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="primary" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2, display: 'block' }}>
              POWERFUL FEATURES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                mb: 2,
                color: 'text.primary'
              }}
            >
              Everything You Need to Succeed
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 700, mx: 'auto', color: 'text.secondary', fontWeight: 400 }}>
              Built specifically for manufactured home dealerships with features that matter most
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      {feature.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" color="primary" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2, display: 'block' }}>
                WHY CHOOSE US
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Industry-Specific Solution
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', color: 'text.secondary', lineHeight: 1.6 }}>
                Unlike generic CRMs, Mobile CRM is built from the ground up for manufactured home dealers. Every feature is designed with your unique workflow in mind.
              </Typography>
              <Stack spacing={2}>
                {[
                  'Pre-built templates for manufactured housing sales',
                  'Integrated compliance and documentation',
                  'Community and lot management features',
                  'Financing and lender integration ready'
                ].map((item, index) => (
                  <Stack direction="row" spacing={2} alignItems="center" key={index}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: 4,
                  p: 4,
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="h4" sx={{ color: 'text.disabled' }}>
                  [Dashboard Preview]
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 8, md: 12 },
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 3 }}>
              Ready to Transform Your Dealership?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join hundreds of successful manufactured home dealers using Mobile CRM to grow their business
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                py: 2,
                px: 6,
                fontSize: '1.2rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Start Free Trial Today
            </Button>
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
              No credit card required • 14-day free trial • Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <HomeIcon sx={{ fontSize: 28, color: 'white' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                  Mobile CRM
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                The #1 CRM platform for manufactured home dealerships
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
                Product
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Features</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Pricing</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Demo</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>API</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>About Us</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Blog</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Careers</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Press</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Help Center</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Contact Us</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Privacy Policy</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>Terms of Service</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
            © {new Date().getFullYear()} Mobile CRM. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
