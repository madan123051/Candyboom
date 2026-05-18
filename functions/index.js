// Firebase Cloud Functions for Candyboom Game

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// 1. Create User Profile on First Login
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Player',
      profilePicture: user.photoURL || '',
      currentLevel: 1,
      totalScore: 0,
      totalStars: 0,
      boosters: {
        hammer: 0,
        lightning: 0,
        bomb: 0,
        shuffle: 0
      },
      referralCode: generateReferralCode(user.uid),
      referredBy: null,
      referrals: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastPlayedAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        pushNotificationsEnabled: true
      }
    });

    console.log(`✅ User profile created for ${user.uid}`);
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
  }
});

// 2. Save Level Result
exports.saveLevelResult = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const uid = context.auth.uid;
  const { levelId, score, stars, moves, time } = data;

  try {
    const userRef = db.collection('users').doc(uid);
    const levelRef = userRef.collection('levels').doc(levelId);

    // Get existing level data
    const existingLevel = await levelRef.get();
    const existingScore = existingLevel.data()?.highScore || 0;
    const existingStars = existingLevel.data()?.stars || 0;

    // Update only if new score is better
    if (score >= existingScore) {
      await levelRef.set({
        levelId: levelId,
        highScore: score,
        stars: Math.max(stars, existingStars),
        moves: moves,
        time: time,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        attempts: (existingLevel.data()?.attempts || 0) + 1
      }, { merge: true });

      // Update user's total score and stars
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.data();
      
      const scoreDifference = score - existingScore;
      const newTotalScore = (userData.totalScore || 0) + scoreDifference;
      const newTotalStars = (userData.totalStars || 0) + (stars - existingStars);

      await userRef.update({
        totalScore: newTotalScore,
        totalStars: newTotalStars,
        currentLevel: Math.max(parseInt(levelId) + 1, userData.currentLevel || 1),
        lastPlayedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      success: true,
      message: 'Level result saved successfully',
      levelId: levelId,
      score: score,
      stars: stars
    };
  } catch (error) {
    console.error('❌ Error saving level result:', error);
    throw new functions.https.HttpsError('internal', 'Error saving level result');
  }
});

// 3. Apply Referral Code
exports.applyReferralCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const uid = context.auth.uid;
  const { referralCode } = data;

  try {
    // Find user with referral code
    const referrerSnapshot = await db.collection('users')
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get();

    if (referrerSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'Invalid referral code');
    }

    const referrerId = referrerSnapshot.docs[0].id;

    if (referrerId === uid) {
      throw new functions.https.HttpsError('invalid-argument', 'Cannot use your own referral code');
    }

    // Update current user
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      referredBy: referrerId,
      bonusCoins: admin.firestore.FieldValue.increment(100)
    });

    // Update referrer
    const referrerRef = db.collection('users').doc(referrerId);
    await referrerRef.update({
      referrals: admin.firestore.FieldValue.arrayUnion(uid),
      bonusCoins: admin.firestore.FieldValue.increment(50)
    });

    return {
      success: true,
      message: 'Referral code applied successfully',
      bonusCoins: 100
    };
  } catch (error) {
    console.error('❌ Error applying referral code:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 4. Get User Leaderboard
exports.getLeaderboard = functions.https.onCall(async (data, context) => {
  try {
    const snapshot = await db.collection('users')
      .orderBy('totalScore', 'desc')
      .limit(50)
      .get();

    const leaderboard = snapshot.docs.map(doc => ({
      uid: doc.id,
      displayName: doc.data().displayName,
      profilePicture: doc.data().profilePicture,
      totalScore: doc.data().totalScore,
      totalStars: doc.data().totalStars,
      currentLevel: doc.data().currentLevel
    }));

    return {
      success: true,
      leaderboard: leaderboard
    };
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    throw new functions.https.HttpsError('internal', 'Error getting leaderboard');
  }
});

// 5. Delete User Account
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const uid = context.auth.uid;

  try {
    // Delete user document and all subcollections
    const userRef = db.collection('users').doc(uid);
    
    // Delete levels subcollection
    const levelsSnapshot = await userRef.collection('levels').get();
    for (const doc of levelsSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete user document
    await userRef.delete();

    // Delete auth user (requires admin SDK)
    await admin.auth().deleteUser(uid);

    return {
      success: true,
      message: 'User account deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting user account:', error);
    throw new functions.https.HttpsError('internal', 'Error deleting user account');
  }
});

// Helper function to generate referral code
function generateReferralCode(uid) {
  const timestamp = Date.now().toString(36);
  const shortUid = uid.substring(0, 6);
  return `${shortUid}${timestamp}`.toUpperCase().substring(0, 8);
}

// Error Logging
exports.logError = functions.https.onCall(async (data, context) => {
  const { error, timestamp } = data;
  
  try {
    await db.collection('error_logs').add({
      error: error,
      userId: context.auth?.uid || 'anonymous',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: context.rawRequest.headers['user-agent']
    });

    return { success: true };
  } catch (err) {
    console.error('❌ Error logging error:', err);
  }
});
