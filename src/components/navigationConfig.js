// Shared navigation configuration for both admin and CRM layouts

import {
  Dashboard as DashboardIcon,
  AccountBalance as CompaniesIcon,
  Settings as SettingsIcon,
  People as LeadsIcon,
  PersonAdd as ProspectsIcon,
  MonetizationOn as DealsIcon,
  Folder as ProjectsIcon,
  Inventory as InventoryIcon,
  PriceChange as PricingIcon,
  CalendarToday as CalendarIcon,
  Task as TasksIcon,
  Description as DocumentsIcon,
  Widgets as ComponentsIcon,
  Build as ServiceIcon,
} from '@mui/icons-material';

// Admin/System level navigation items
export const ADMIN_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    showForRoles: ['admin'] // System admins only
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: CompaniesIcon,
    path: '/companies',
    showForRoles: ['admin']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    path: '/settings',
    showForRoles: ['admin']
  }
];

// CRM navigation items
export const CRM_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/crm/dashboard',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: LeadsIcon,
    path: '/crm/leads',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'prospects',
    label: 'Prospects',
    icon: ProspectsIcon,
    path: '/crm/prospects',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: DealsIcon,
    path: '/crm/deals',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: ProjectsIcon,
    path: '/crm/projects',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: InventoryIcon,
    path: '/crm/inventory',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'master-pricing',
    label: 'Master Pricing',
    icon: PricingIcon,
    path: '/crm/master-pricing',
    showForRoles: ['admin', 'leadership', 'general_manager']
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: CalendarIcon,
    path: '/crm/calendar',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: TasksIcon,
    path: '/crm/tasks',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'forms',
    label: 'Forms',
    icon: DocumentsIcon,
    path: '/crm/forms',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'service',
    label: 'Service',
    icon: ServiceIcon,
    path: '/crm/service',
    showForRoles: ['admin', 'leadership', 'general_manager', 'sales', 'operations']
  },
  {
    id: 'components',
    label: 'Components',
    icon: ComponentsIcon,
    path: '/crm/components',
    showForRoles: ['admin', 'leadership'] // Only admin and leadership can access components
  },
  {
    id: 'setup',
    label: 'Setup',
    icon: SettingsIcon,
    path: '/crm/setup',
    showForRoles: ['admin', 'leadership'] // Only admin and leadership can access setup
  }
];

// Helper function to filter navigation items based on user role
export function getVisibleNavItems(navItems, userRole = 'sales') {
  return navItems.filter(item => item.showForRoles.includes(userRole));
}

// Layout titles
export const LAYOUT_TITLES = {
  admin: 'MobileCRM',
  crm: 'CRM Portal'
};
