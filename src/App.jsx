import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Settings from './components/Settings';
// CRM Components
import CRMDashboard from './components/crm/CRMDashboard';
import Leads from './components/crm/Leads';
import Prospects from './components/crm/Prospects';
import Clients from './components/crm/Clients';
import ProspectPortal from './components/crm/ProspectPortal';
import CustomerApplicationStandalone from './components/crm/CustomerApplicationStandalone';
import Deals from './components/crm/Deals';
import Projects from './components/crm/Projects';
import ProjectPortal from './components/crm/ProjectPortal';
import LandAsset from './components/crm/LandAsset';
import AvailablePropertiesPublic from './components/crm/AvailablePropertiesPublic';
import Spec from './components/crm/Spec';
import Inventory from './components/crm/Inventory';
import MasterPricing from './components/crm/MasterPricing';
import Calendar from './components/crm/Calendar';
import Tasks from './components/crm/Tasks';
import Forms from './components/crm/Forms';
import Service from './components/crm/Service';
import Components from './components/crm/Components';
import Setup from './components/crm/Setup';
import LocationPortal from './components/crm/LocationPortal';
import CustomerApplication from './components/crm/CustomerApplication';

import { ThemeProviderWrapper } from './ThemeContext';
import { useAppSelector, useAppDispatch } from './hooks/useRedux';
import { selectCurrentUser, selectAuthStatus } from './redux-store/slices/authSlice';
import {
  loadUserProfile,
  selectUserProfile,
  selectUserStatus
} from './redux-store/slices/userSlice';
import { useEffect } from 'react';

function PrivateRoute({ children }) {
  const currentUser = useAppSelector(selectCurrentUser);
  const authStatus = useAppSelector(selectAuthStatus);

  if (authStatus === 'loading' || authStatus === 'idle') {
    return <div>Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" replace />;
}

function HomeRedirect() {
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector(selectUserProfile);
  const userStatus = useAppSelector(selectUserStatus);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    dispatch(loadUserProfile());
  }, [dispatch, currentUser?.uid]);

  // If not logged in, show landing page
  if (!currentUser) {
    return <LandingPage />;
  }

  // Wait for user profile to load completely
  if (userStatus === 'loading' || userStatus === 'idle' || !userProfile) {
    return <div>Loading user profile...</div>;
  }

  // Logged in users go to CRM dashboard
  return <Navigate to="/crm/dashboard" replace />;
}

function App() {
  return (
    <ThemeProviderWrapper>
      <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
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
                path="/crm/locations/:locationId"
                element={
                  <PrivateRoute>
                    <LocationPortal />
                  </PrivateRoute>
                }
              />
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
                path="/crm/prospects/:prospectId/application"
                element={
                  <PrivateRoute>
                    <CustomerApplicationStandalone />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/deals/:dealId/application"
                element={
                  <PrivateRoute>
                    <CustomerApplicationStandalone />
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
                path="/crm/deals/:dealId"
                element={
                  <PrivateRoute>
                    <ProspectPortal />
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
                path="/crm/projects/:projectId"
                element={
                  <PrivateRoute>
                    <ProjectPortal />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/land-asset"
                element={
                  <PrivateRoute>
                    <LandAsset />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/spec"
                element={
                  <PrivateRoute>
                    <Spec />
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
                path="/crm/master-pricing"
                element={
                  <PrivateRoute>
                    <MasterPricing />
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
                path="/crm/forms"
                element={
                  <PrivateRoute>
                    <Forms />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/service"
                element={
                  <PrivateRoute>
                    <Service />
                  </PrivateRoute>
                }
              />
              <Route
                path="/crm/components"
                element={
                  <PrivateRoute>
                    <Components />
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
              {/* Public Routes */}
              <Route
                path="/application/:prospectId"
                element={<CustomerApplication />}
              />
              <Route
                path="/crm/available-properties"
                element={<AvailablePropertiesPublic />}
              />
              <Route path="/" element={<HomeRedirect />} />
            </Routes>
          </Router>
    </ThemeProviderWrapper>
  );
}

export default App;
