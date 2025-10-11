/**
 * User Migration Utility
 * 
 * This utility helps sync existing users from the nested location structure
 * to the top-level users collection for easier global access.
 * 
 * Run this once to migrate existing users.
 */

import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export const migrateUsersToTopLevel = async () => {
  console.log('Starting user migration...');
  
  try {
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    let migratedCount = 0;
    let errorCount = 0;

    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;
      console.log(`Processing company: ${companyId}`);

      const locationsSnapshot = await getDocs(
        collection(db, 'companies', companyId, 'locations')
      );

      for (const locationDoc of locationsSnapshot.docs) {
        const locationId = locationDoc.id;
        console.log(`  Processing location: ${locationId}`);

        const usersSnapshot = await getDocs(
          collection(db, 'companies', companyId, 'locations', locationId, 'users')
        );

        for (const userDoc of usersSnapshot.docs) {
          try {
            const userData = userDoc.data();
            const firebaseUid = userData.firebaseUid || userDoc.id;

            // Create user data with all necessary fields
            const topLevelUserData = {
              firebaseUid: firebaseUid,
              email: userData.email,
              displayName: userData.displayName || userData.name || userData.email,
              name: userData.name || userData.displayName || userData.email,
              firstName: userData.firstName || userData.displayName?.split(' ')[0] || '',
              lastName: userData.lastName || userData.displayName?.split(' ').slice(1).join(' ') || '',
              role: userData.role,
              companyId: companyId,
              locationId: locationId,
              status: userData.status || 'active',
              createdAt: userData.createdAt
            };

            // Create or update in top-level users collection
            await setDoc(doc(db, 'users', firebaseUid), topLevelUserData);

            console.log(`    ✓ Migrated user: ${userData.email}`);
            migratedCount++;
          } catch (error) {
            console.error(`    ✗ Error migrating user ${userDoc.id}:`, error);
            errorCount++;
          }
        }
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully migrated: ${migratedCount} users`);
    console.log(`Errors: ${errorCount}`);

    return {
      success: true,
      migratedCount,
      errorCount
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify migration by checking if all users exist in top-level collection
 */
export const verifyUserMigration = async () => {
  console.log('Verifying user migration...');

  try {
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    let totalUsers = 0;
    let migratedUsers = 0;

    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;
      const locationsSnapshot = await getDocs(
        collection(db, 'companies', companyId, 'locations')
      );

      for (const locationDoc of locationsSnapshot.docs) {
        const locationId = locationDoc.id;
        const usersSnapshot = await getDocs(
          collection(db, 'companies', companyId, 'locations', locationId, 'users')
        );

        for (const userDoc of usersSnapshot.docs) {
          totalUsers++;
          const userData = userDoc.data();
          const firebaseUid = userData.firebaseUid || userDoc.id;

          // Check if exists in top-level collection
          const topLevelUserDoc = await getDocs(collection(db, 'users'));
          const exists = topLevelUserDoc.docs.some(
            doc => doc.id === firebaseUid
          );

          if (exists) {
            migratedUsers++;
            console.log(`  ✓ ${userData.email}`);
          } else {
            console.log(`  ✗ ${userData.email} - NOT FOUND in top-level collection`);
          }
        }
      }
    }

    console.log('\n=== Verification Complete ===');
    console.log(`Total users in locations: ${totalUsers}`);
    console.log(`Users in top-level collection: ${migratedUsers}`);
    console.log(`Success rate: ${((migratedUsers / totalUsers) * 100).toFixed(1)}%`);

    return {
      totalUsers,
      migratedUsers,
      successRate: (migratedUsers / totalUsers) * 100
    };
  } catch (error) {
    console.error('Verification failed:', error);
    return {
      error: error.message
    };
  }
};


