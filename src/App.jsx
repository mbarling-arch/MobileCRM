import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProviderWrapper } from './ThemeContext';
import { UserProvider, useUser } from './UserContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Companies from './components/Companies';
import CompanyPortal from './components/CompanyPortal';
// Users route removed; managed inside company portal
// Reports removed
import Settings from './components/Settings';
// CRM Components
import CRMDashboard from './components/crm/CRMDashboard';
import Leads from './components/crm/Leads';
import Prospects from './components/crm/Prospects';
import Clients from './components/crm/Clients';
import ProspectPortal from './components/crm/ProspectPortal';
import Deals from './components/crm/Deals';
import Projects from './components/crm/Projects';
import Inventory from './components/crm/Inventory';
import Calendar from './components/crm/Calendar';
import Tasks from './components/crm/Tasks';
import Documents from './components/crm/Documents';
import Setup from './components/crm/Setup';
import CustomerApplication from './components/crm/CustomerApplication';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function HomeRedirect() {
  const { userProfile, loading } = useUser();

  // Debug logging
  console.log('HomeRedirect - loading:', loading, 'userProfile:', userProfile);

  // Wait for user profile to load completely
  if (loading || !userProfile) {
    return <div>Loading user profile...</div>;
  }

  // All users with company membership are CRM users (including admins)
  if (userProfile.companyId && userProfile.locationId) {
    console.log('Redirecting to CRM dashboard for user:', userProfile.email, 'companyId:', userProfile.companyId, 'locationId:', userProfile.locationId);
    return <Navigate to="/crm/dashboard" replace />;
  }

  // System-level admins (no company membership) go to admin dashboard
  console.log('Redirecting to admin dashboard for user:', userProfile.email || 'unknown');
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <ThemeProviderWrapper>
      <AuthProvider>
        <UserProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            <Route
              path="/companies"
              element={
                <PrivateRoute>
                  <Companies />
                </PrivateRoute>
              }
            />
            <Route
              path="/companies/:companyId"
              element={
                <PrivateRoute>
                  <CompanyPortal />
                </PrivateRoute>
              }
            />
            {/* Users route removed */}
              {/* Reports route removed */}
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              {/* CRM Routes */}
              <Route
                path="/crm/dashboard"
                element={
                  <PrivateRoute>
                    <CRMDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/leads"
                element={
                  <PrivateRoute>
                    <Leads />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/prospects"
                element={
                  <PrivateRoute>
                    <Prospects />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/prospects/:prospectId"
                element={
                  <PrivateRoute>
                    <ProspectPortal />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/clients"
                element={
                  <PrivateRoute>
                    <Clients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/deals"
                element={
                  <PrivateRoute>
                    <Deals />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/projects"
                element={
                  <PrivateRoute>
                    <Projects />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/inventory"
                element={
                  <PrivateRoute>
                    <Inventory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/calendar"
                element={
                  <PrivateRoute>
                    <Calendar />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/tasks"
                element={
                  <PrivateRoute>
                    <Tasks />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/tasks/today"
                element={
                  <PrivateRoute>
                    <Tasks type="today" />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/tasks/past-due"
                element={
                  <PrivateRoute>
                    <Tasks type="past-due" />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/tasks/team"
                element={
                  <PrivateRoute>
                    <Tasks type="team" />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/documents"
                element={
                  <PrivateRoute>
                    <Documents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/setup"
                element={
                  <PrivateRoute>
                    <Setup />
                  </PrivateRoute>
                }
              />
              {/* Public Customer Application Route */}
              <Route
                path="/application/:prospectId"
                element={<CustomerApplication />}
              />
              <Route path="/" element={<HomeRedirect />} />
            </Routes>
          </Router>
        </UserProvider>
      </AuthProvider>
    </ThemeProviderWrapper>
  );
}

export default App;
