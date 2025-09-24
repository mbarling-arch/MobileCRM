import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

// Role hierarchy and permissions
export const ROLES = {
  ADMIN: 'admin',
  LEADERSHIP: 'leadership',
  GENERAL_MANAGER: 'general_manager',
  SALES: 'sales',
  OPERATIONS: 'operations'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canManageUsers: true,
    canManageCompanies: true,
    canManageLocations: true,
    canViewAllCompanies: true,
    canViewAllLocations: true,
    canViewAllData: true,
    level: 5
  },
  [ROLES.LEADERSHIP]: {
    canManageUsers: true,
    canManageCompanies: false,
    canManageLocations: false,
    canViewAllCompanies: true,
    canViewAllLocations: true,
    canViewAllData: true,
    level: 4
  },
  [ROLES.GENERAL_MANAGER]: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageLocations: false,
    canViewAllCompanies: false,
    canViewAllLocations: true, // Can view all locations in their company
    canViewAllData: true, // Can view all data in their company
    level: 3
  },
  [ROLES.SALES]: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageLocations: false,
    canViewAllCompanies: false,
    canViewAllLocations: false, // Only their assigned location
    canViewAllData: false, // Only their assigned location data
    level: 2
  },
  [ROLES.OPERATIONS]: {
    canManageUsers: false,
    canManageCompanies: false,
    canManageLocations: false,
    canViewAllCompanies: false,
    canViewAllLocations: false, // Only their assigned location
    canViewAllData: false, // Only their assigned location data
    level: 1
  }
};

export function UserProvider({ children }) {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [accessibleCompanies, setAccessibleCompanies] = useState([]);
  const [accessibleLocations, setAccessibleLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user profile and permissions
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) {
        setUserProfile(null);
        setUserPermissions(null);
        setAccessibleCompanies([]);
        setAccessibleLocations([]);
        setLoading(false);
        return;
      }

      try {
        // First, try to find the user in the multi-tenant structure
        const companiesSnapshot = await getDocs(collection(db, 'companies'));

        let userData = null;
        let userCompany = null;
        let userLocation = null;

        // Search through all companies and locations for this user
        for (const companyDoc of companiesSnapshot.docs) {
          const companyData = { id: companyDoc.id, ...companyDoc.data() };
          const locationsSnapshot = await getDocs(collection(db, 'companies', companyDoc.id, 'locations'));

          for (const locationDoc of locationsSnapshot.docs) {
            const locationData = { id: locationDoc.id, ...locationDoc.data() };
            const usersSnapshot = await getDocs(collection(db, 'companies', companyDoc.id, 'locations', locationDoc.id, 'users'));

            const userDoc = usersSnapshot.docs.find(doc => doc.data().email === currentUser.email);
            if (userDoc) {
              userData = { id: userDoc.id, ...userDoc.data() };
              userCompany = companyData;
              userLocation = locationData;
              break;
            }
          }
          if (userData) break;
        }

        if (userData) {
          const profile = {
            ...userData,
            companyId: userCompany.id,
            locationId: userLocation.id,
            company: userCompany,
            location: userLocation,
            firebaseUser: currentUser
          };

          setUserProfile(profile);
          setUserPermissions(ROLE_PERMISSIONS[userData.role] || ROLE_PERMISSIONS[ROLES.SALES]);

          // Set accessible companies and locations based on role
          const permissions = ROLE_PERMISSIONS[userData.role] || ROLE_PERMISSIONS[ROLES.SALES];

          if (permissions.canViewAllCompanies) {
            // Load all companies
            const allCompanies = companiesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setAccessibleCompanies(allCompanies);
          } else {
            // Only their company
            setAccessibleCompanies([userCompany]);
          }

          if (permissions.canViewAllLocations) {
            // Load all locations for accessible companies
            const allLocations = [];
            for (const company of (permissions.canViewAllCompanies ? companiesSnapshot.docs : [userCompany])) {
              const locationsSnapshot = await getDocs(collection(db, 'companies', company.id, 'locations'));
              locationsSnapshot.docs.forEach(doc => {
                allLocations.push({
                  id: doc.id,
                  companyId: company.id,
                  ...doc.data()
                });
              });
            }
            setAccessibleLocations(allLocations);
          } else {
            // Only their location
            setAccessibleLocations([{
              id: userLocation.id,
              companyId: userCompany.id,
              ...userLocation
            }]);
          }
        } else {
          // User not found in multi-tenant structure, create default profile
          setUserProfile({
            email: currentUser.email,
            role: ROLES.ADMIN, // Default to admin for now
            firebaseUser: currentUser
          });
          setUserPermissions(ROLE_PERMISSIONS[ROLES.ADMIN]);
          setAccessibleCompanies([]);
          setAccessibleLocations([]);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile(null);
        setUserPermissions(null);
        setAccessibleCompanies([]);
        setAccessibleLocations([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [currentUser]);

  // Helper functions
  const hasPermission = (permission) => {
    return userPermissions ? userPermissions[permission] : false;
  };

  const canAccessCompany = (companyId) => {
    return accessibleCompanies.some(company => company.id === companyId);
  };

  const canAccessLocation = (locationId) => {
    return accessibleLocations.some(location => location.id === locationId);
  };

  const getFilteredQuery = (baseQuery, collectionType) => {
    // This would be used to filter queries based on user permissions
    // For now, return the base query - implement filtering logic as needed
    return baseQuery;
  };

  const value = {
    userProfile,
    userPermissions,
    accessibleCompanies,
    accessibleLocations,
    loading,
    hasPermission,
    canAccessCompany,
    canAccessLocation,
    getFilteredQuery,
    ROLES,
    ROLE_PERMISSIONS
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
