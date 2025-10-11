import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  Divider,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Switch,
  Alert,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import UnifiedLayout from '../UnifiedLayout';
import BaseDrawer, { DrawerActions } from '../BaseDrawer';
import { FormTextField, FormSelect, FormGrid, FormGridItem, FormSection } from '../FormField';
import ListContainer from '../ListContainer';
import GlobalDataTable from '../GlobalDataTable';

// Sample data for demonstrations
const sampleTableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', role: 'Editor' },
];

const sampleListData = [
  { id: 1, primary: 'Primary Text', secondary: 'Secondary text here' },
  { id: 2, primary: 'Another Item', secondary: 'More details' },
  { id: 3, primary: 'Third Item', secondary: 'Additional information' },
];

function Components() {
  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    active: true,
  });

  const handleFormChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    console.log('Saving:', formData);
    setDrawerOpen(false);
  };

  const renderComponentCard = (title, description, children, code = null) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'customColors.calendarBorder', borderRadius: 1, bgcolor: 'customColors.tableRowBackground' }}>
          {children}
        </Box>
        {code && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
              {code}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <UnifiedLayout mode="crm">
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Global Components Library
            </Typography>
            <Typography variant="body1" color="text.secondary">
              A comprehensive showcase of all reusable components. Use these as building blocks for new features.
            </Typography>
          </Box>

          {/* Component Categories */}
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Layout & Navigation" />
            <Tab label="Data Display" />
            <Tab label="Forms & Inputs" />
            <Tab label="Feedback & Actions" />
            <Tab label="Containers" />
          </Tabs>

          {/* Layout & Navigation Components */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {renderComponentCard(
                'UnifiedLayout',
                'Main application layout with navigation sidebar and header',
                <Box sx={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
                  <Typography>UnifiedLayout Container</Typography>
                </Box>,
                '<UnifiedLayout mode="crm"><YourContent /></UnifiedLayout>'
              )}

              {renderComponentCard(
                'ListContainer',
                'Standardized list page layout with header, actions, and optional tabs',
                <ListContainer
                  title="Sample List"
                  subtitle="3 items"
                  actions={<Button variant="contained" size="small">Add New</Button>}
                  tableProps={{
                    columns: [
                      { key: 'name', header: 'Name', render: (v) => v },
                      { key: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" /> }
                    ],
                    rows: sampleTableData.slice(0, 2),
                    dense: true,
                    variant: 'embedded'
                  }}
                />,
                '<ListContainer title="..." actions={...} tableProps={...} />'
              )}
            </Grid>
          )}

          {/* Data Display Components */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {renderComponentCard(
                'GlobalDataTable',
                'Theme-aware data table with consistent styling and actions',
                <GlobalDataTable
                  title="Sample Data"
                  columns={[
                    { key: 'name', header: 'Name', render: (v) => v },
                    { key: 'email', header: 'Email', render: (v) => v },
                    { key: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={v === 'Active' ? 'success' : 'default'} /> },
                    { key: 'actions', header: 'Actions', render: () => (
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small"><EditIcon /></IconButton>
                        <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                      </Stack>
                    )}
                  ]}
                  rows={sampleTableData}
                  dense
                  variant="embedded"
                />,
                '<GlobalDataTable columns={...} rows={...} dense />'
              )}

              {renderComponentCard(
                'Enhanced List',
                'Material-UI List with secondary actions and icons',
                <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                  {sampleListData.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText primary={item.primary} secondary={item.secondary} />
                      <ListItemSecondaryAction>
                        <IconButton size="small"><EditIcon /></IconButton>
                        <IconButton size="small"><MoreIcon /></IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>,
                '<List><ListItem><ListItemText /><ListItemSecondaryAction>...</ListItemSecondaryAction></ListItem></List>'
              )}
            </Grid>
          )}

          {/* Forms & Inputs Components */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {renderComponentCard(
                'FormField Components',
                'Consistent form inputs with labels always at the top and proper styling',
                <FormGrid>
                  <FormGridItem>
                    <FormTextField
                      label="Full Name"
                      value={formData.name}
                      onChange={handleFormChange('name')}
                      required
                      placeholder="Enter full name"
                    />
                  </FormGridItem>
                  <FormGridItem>
                    <FormTextField
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange('email')}
                      required
                      placeholder="Enter email address"
                    />
                  </FormGridItem>
                  <FormGridItem>
                    <FormSelect
                      label="Role"
                      value={formData.role}
                      onChange={handleFormChange('role')}
                      options={[
                        { value: 'admin', label: 'Administrator' },
                        { value: 'user', label: 'User' },
                        { value: 'editor', label: 'Editor' }
                      ]}
                    />
                  </FormGridItem>
                  <FormGridItem>
                    <FormTextField
                      label="Phone Number"
                      type="number"
                      value={formData.phone || ''}
                      onChange={handleFormChange('phone')}
                      placeholder="No arrow controls"
                    />
                  </FormGridItem>
                </FormGrid>,
                '<FormTextField label="..." placeholder="..." value={...} onChange={...} />'
              )}

              {renderComponentCard(
                'BaseDrawer + DrawerActions',
                'Standardized drawer layout for forms and details',
                <Box>
                  <Button variant="outlined" onClick={() => setDrawerOpen(true)}>
                    Open Drawer Demo
                  </Button>
                  <BaseDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    title="Component Demo"
                    width={400}
                    actions={
                      <DrawerActions
                        onCancel={() => setDrawerOpen(false)}
                        onSubmit={handleSave}
                        submitLabel="Save Component"
                      />
                    }
                  >
                    <Typography>This is a demo of the BaseDrawer component.</Typography>
                  </BaseDrawer>
                </Box>,
                '<BaseDrawer open={...} title="..." actions={<DrawerActions ... />}><FormContent /></BaseDrawer>'
              )}
            </Grid>
          )}

          {/* Feedback & Actions Components */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              {renderComponentCard(
                'Action Buttons',
                'Standard button styles and icon combinations',
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button variant="contained" startIcon={<AddIcon />}>Add New</Button>
                  <Button variant="outlined" startIcon={<EditIcon />}>Edit</Button>
                  <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>Delete</Button>
                  <Button variant="text" startIcon={<SearchIcon />}>Search</Button>
                </Stack>,
                '<Button variant="contained" startIcon={<AddIcon />}>Add New</Button>'
              )}

              {renderComponentCard(
                'Status Indicators',
                'Chips, badges, and status indicators',
                <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                  <Chip label="Active" color="success" size="small" />
                  <Chip label="Inactive" color="default" size="small" />
                  <Chip label="Pending" color="warning" size="small" />
                  <Badge badgeContent={4} color="error">
                    <IconButton><FavoriteIcon /></IconButton>
                  </Badge>
                  <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
                </Stack>,
                '<Chip label="Active" color="success" size="small" />'
              )}

              {renderComponentCard(
                'Alerts & Notifications',
                'Feedback messages and status alerts',
                <Stack spacing={2}>
                  <Alert severity="success">Operation completed successfully!</Alert>
                  <Alert severity="error">An error occurred while saving.</Alert>
                  <Alert severity="warning">Please review the form before submitting.</Alert>
                  <Alert severity="info">New updates are available.</Alert>
                </Stack>,
                '<Alert severity="success">Message</Alert>'
              )}
            </Grid>
          )}

          {/* Containers Components */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              {renderComponentCard(
                'Paper Containers',
                'Theme-aware paper containers with consistent elevation and borders',
                <Stack spacing={2}>
                  <Paper sx={{ p: 2, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder' }}>
                    <Typography variant="h6">Header Background</Typography>
                    <Typography variant="body2">Used for section headers and navigation</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6">Default Paper</Typography>
                    <Typography variant="body2">Standard content containers</Typography>
                  </Paper>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6">Elevated Paper</Typography>
                    <Typography variant="body2">Cards and elevated content</Typography>
                  </Paper>
                </Stack>,
                '<Paper sx={{ p: 2, backgroundColor: "customColors.calendarHeaderBackground" }}>Content</Paper>'
              )}

              {renderComponentCard(
                'Grid System',
                'Responsive grid layouts with consistent spacing',
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                      <Typography>Grid Item 1 (6/12)</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                      <Typography>Grid Item 2 (6/12)</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: 'success.main', color: 'success.contrastText' }}>
                      <Typography>Item 3 (4/12)</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper sx={{ p: 2, bgcolor: 'warning.main', color: 'warning.contrastText' }}>
                      <Typography>Item 4 (8/12)</Typography>
                    </Paper>
                  </Grid>
                </Grid>,
                '<Grid container spacing={2}><Grid item xs={12} md={6}>Content</Grid></Grid>'
              )}
            </Grid>
          )}

          {/* Usage Guidelines */}
          <Paper sx={{ p: 3, backgroundColor: 'customColors.calendarHeaderBackground', border: '1px solid', borderColor: 'customColors.calendarBorder', color: 'text.primary' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              Usage Guidelines
            </Typography>
            <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
              All components are fully theme-aware and will automatically adapt to light/dark mode changes.
              Use the provided import statements and prop interfaces for consistency across the application.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Chip label="Theme-Aware" color="primary" size="small" />
              <Chip label="Responsive" color="secondary" size="small" />
              <Chip label="Accessible" color="success" size="small" />
              <Chip label="Consistent" color="info" size="small" />
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </UnifiedLayout>
  );
}

export default Components;
