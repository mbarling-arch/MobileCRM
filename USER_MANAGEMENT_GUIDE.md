# User Management & Location Tracking Guide

## Overview

This guide explains how the MobileCRM system now manages users, tracks ownership, and maintains location-specific data separation.

## 🎯 What Was Fixed

### 1. **Users Not Showing in Calendar**
**Problem:** Calendar couldn't find users to assign appointments to.

**Solution:** 
- Fixed the user query path in `Calendar.jsx` to read from the correct location: `companies/{companyId}/locations/{locationId}/users`
- Added dual-storage system: users are now stored in both location-specific paths AND a top-level collection for easier access

### 2. **Users Not Appearing in Team Member Section**
**Problem:** Calendar sidebar couldn't display team members.

**Solution:** Same fix as above - now reads from the correct user path with proper location filtering.

### 3. **User Database Sync Issue**
**Problem:** Users created in Firebase Auth weren't automatically added to the database.

**Solution:** 
- Updated `Setup.jsx` to create users in BOTH locations when a new user is added
- Updated `authSlice.js` to sync users during signup
- Created migration utility to sync existing users

## 📊 Database Structure

### User Storage Architecture

Users are now stored in TWO places for optimal access:

#### 1. Location-Specific Path (Primary)
```
companies/{companyId}/locations/{locationId}/users/{userId}
```
**Purpose:** Main user data tied to specific location
**Contains:**
- firebaseUid
- email
- displayName, name, firstName, lastName
- role (admin, leadership, general_manager, sales, operations)
- companyId, locationId
- status, createdAt

#### 2. Top-Level Collection (Index)
```
users/{userId}
```
**Purpose:** Global user index for cross-location features (calendar, etc.)
**Contains:** Same fields as location-specific path

### Lead Structure

Leads properly track ownership and location:

```javascript
{
  companyId: "company-id",
  locationId: "location-id",      // ← Separates leads by store
  assignedTo: "user@email.com",   // ← Tracks who owns the lead
  firstName: "John",
  lastName: "Doe",
  phone: "555-1234",
  email: "john@example.com",
  source: "facebook",
  status: "new",
  createdAt: Timestamp,
  createdBy: "creator@email.com",
  archived: false
}
```

## 🔧 How It Works

### Creating a New User

When you create a user in the Setup page:

1. **Firebase Auth Account** is created with email/password
2. **Location-Specific User Document** is created at:
   ```
   companies/{companyId}/locations/{locationId}/users/{firebaseUid}
   ```
3. **Top-Level User Document** is created at:
   ```
   users/{firebaseUid}
   ```

Both documents contain the same data, ensuring users appear in:
- ✅ Calendar assignment dropdown
- ✅ Team member sidebar
- ✅ Location-specific user lists
- ✅ Any cross-location admin views

### Lead Ownership System

Leads work like a CRM "owner" system:

1. **When created:** Lead gets `assignedTo` (user's email) and `locationId`
2. **In "My Leads" tab:** Shows only leads where `assignedTo === currentUser.email`
3. **In "My Team's Leads" tab:** Shows leads where `locationId === currentLocation` but `assignedTo !== currentUser`
4. **In "Unclaimed" tab:** Shows leads where `assignedTo` is empty/null

### Location Separation

Each location operates independently:

- **Leads** are filtered by `locationId`
- **Users** see only their location's data (unless they have admin/leadership role)
- **Calendar** shows team members from the same location
- **Appointments** are tied to leads/prospects/deals which are location-specific

## 🚀 Migration for Existing Systems

If you have existing users that need to be synced:

### Step 1: Go to Setup Page
Navigate to: **CRM → Setup**

### Step 2: Go to Users Tab
Click on the "Users" tab

### Step 3: Click "Sync Users"
You'll see an info box at the top with a "Sync Users" button. Click it.

### What It Does:
- Scans all companies and locations
- Finds all existing users
- Creates matching documents in the top-level `users` collection
- Preserves all user data
- Shows success message with count

### When to Use:
- After upgrading to this version
- If calendar/team features aren't working
- After importing users via CSV
- If you manually added users via Firestore console

## 📋 User Roles & Permissions

### Role Hierarchy

1. **Admin** (Level 5)
   - Full system access
   - Can manage users, companies, locations
   - Can view all data across all locations

2. **Leadership** (Level 4)
   - Can view all data
   - Cannot manage companies/locations
   - Cannot manage users

3. **General Manager** (Level 3)
   - Can view all locations in their company
   - Can view all data
   - Cannot manage users or settings

4. **Sales** (Level 2)
   - Can only view their own location's data
   - Can only see their own leads (My Leads) and team leads

5. **Operations** (Level 1)
   - Same as Sales
   - Can access operations-specific features

### Custom Roles

You can create custom roles in the Setup → Roles & Permissions tab:
- Define which pages users can access
- Assign custom roles to users
- Built-in roles cannot be edited (system-protected)

## 🎨 Calendar Features

### Team Member View

The calendar sidebar shows:
- All users at your location
- Color-coded by user
- Checkbox to show/hide each person's appointments
- "View All" toggle

### Assigning Appointments

When creating an appointment:
1. Select event type (Appointment or Visit)
2. Search for a customer (lead/prospect/deal)
3. Choose date/time
4. **Assign to** dropdown shows all users at your location
5. Default: auto-assigns to you

### How Appointments Display

Appointments show on the calendar if:
- They're assigned to a selected team member (checked in sidebar)
- They belong to a lead/prospect/deal at your location
- Each user's appointments appear in their designated color

## 🔍 Filtering & Data Access

### Location-Based Filtering

The system automatically filters data by location for non-admin users:

```javascript
// Leads filtered by location
const myLeads = leads.filter(l => 
  l.assignedTo === currentUser.email
);

const teamLeads = leads.filter(l => 
  l.locationId === currentLocation && 
  l.assignedTo !== currentUser.email
);

// Calendar users filtered by location
const users = await getDocs(
  collection(db, 'companies', companyId, 'locations', locationId, 'users')
);
```

### Admin/Leadership Override

Users with `canViewAllLocations` permission can see data across all locations.

## 📝 Best Practices

### For Admins

1. **Always assign users to a location** when creating them
2. **Use the Sync Users button** after bulk imports
3. **Verify location assignments** match your store structure
4. **Use custom roles** for specialized permissions

### For Sales Reps

1. **Claim leads** from the "Unclaimed" tab
2. **Set appointments** when scheduling customer visits
3. **Log calls** to track last contacted date
4. **Convert leads to prospects** when qualified

### For Managers

1. **Monitor team leads** in the "My Team's Leads" tab
2. **Check calendar** to see team member schedules
3. **Review unclaimed leads** regularly
4. **Assign leads** to team members as needed

## 🐛 Troubleshooting

### Users Not Showing in Calendar

**Solution:** 
1. Go to Setup → Users tab
2. Click "Sync Users" button
3. Wait for success message
4. Refresh calendar page

### Team Member Missing from Sidebar

**Check:**
- User is assigned to the same location
- User has `status: 'active'`
- Calendar is using the correct locationId

**Fix:**
1. Run user sync (Setup → Users → Sync Users)
2. Verify user's locationId in Firestore

### Can't See Team Member's Appointments

**Check:**
- Team member checkbox is selected in sidebar
- Appointments are assigned to that user's email
- You're viewing the correct date range

### Leads Not Filtered Correctly

**Check:**
- Lead has proper `locationId`
- Lead's `assignedTo` field matches user email exactly
- You're in the correct tab (My Leads vs Team Leads)

## 📂 File Changes Summary

### Modified Files

1. **src/components/crm/Calendar.jsx**
   - Fixed user query path to read from location-specific collection
   - Now displays team members correctly

2. **src/components/crm/Setup.jsx**
   - Added dual-storage when creating users
   - Added migration utility button
   - Improved user deletion to remove from both locations

3. **src/redux-store/slices/authSlice.js**
   - Updated signup to create users in both collections
   - Added proper user data structure

### New Files

1. **src/utils/migrateUsers.js**
   - Migration utility for existing users
   - Verification function
   - Console logging for debugging

2. **USER_MANAGEMENT_GUIDE.md**
   - This comprehensive guide

## 🎓 Technical Details

### Why Dual Storage?

**Location-Specific:**
- Maintains proper data hierarchy
- Enables location-based permissions
- Preserves company/location relationship
- Primary source of truth

**Top-Level:**
- Fast global lookups (no nested queries)
- Enables cross-location features (calendar)
- Simplifies admin dashboards
- Index for quick access

### Firebase Queries

```javascript
// Get users for calendar (fast)
const usersRef = collection(db, 'companies', companyId, 'locations', locationId, 'users');
const snapshot = await getDocs(usersRef);

// Get all users (admin view, slower)
const allUsersRef = collection(db, 'users');
const allUsers = await getDocs(allUsersRef);

// Get leads for location
const leadsRef = collection(db, 'companies', companyId, 'leads');
const q = query(leadsRef, where('locationId', '==', locationId));
```

### Data Consistency

- Users are created in both places atomically
- Updates should target location-specific path
- Deletions remove from both collections
- Migration can be run multiple times safely (idempotent)

## 📞 Support

If you encounter issues not covered here:

1. Check browser console for errors
2. Verify Firestore rules allow user access
3. Run user migration utility
4. Check that locationId is properly set
5. Ensure user has correct role/permissions

---

**Last Updated:** October 2025
**Version:** 1.26.01+


