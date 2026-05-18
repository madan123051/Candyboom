const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const USERS = 'users';
const REFERRALS = 'referrals';

function requireAuth(req) {
  if (!req.auth?.uid) throw new HttpsError('unauthenticated', 'Login required');
  return req.auth.uid;
}

exports.createOrInitUserProfile = onCall(async (req) => {
  const uid = requireAuth(req);
  const ref = db.collection(USERS).doc(uid);
  const snap = await ref.get();
  if (snap.exists) return { ok: true, user: snap.data() };

  const payload = {
    uid,
    currentLevel: 1,
    totalScore: 0,
    boosters: { extraMoves: 0 },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  await ref.set(payload);
  return { ok: true, user: { uid, currentLevel: 1, totalScore: 0 } };
});

exports.saveLevelResult = onCall(async (req) => {
  const uid = requireAuth(req);
  const { level, score, stars } = req.data || {};
  if (!Number.isInteger(level) || level < 1) throw new HttpsError('invalid-argument', 'Invalid level');
  if (!Number.isInteger(score) || score < 0) throw new HttpsError('invalid-argument', 'Invalid score');
  if (!Number.isInteger(stars) || stars < 0 || stars > 3) throw new HttpsError('invalid-argument', 'Invalid stars');

  const userRef = db.collection(USERS).doc(uid);
  const levelRef = userRef.collection('levels').doc(String(level));

  await db.runTransaction(async (tx) => {
    const [userSnap, levelSnap] = await Promise.all([tx.get(userRef), tx.get(levelRef)]);
    const user = userSnap.data() || { currentLevel: 1, totalScore: 0 };
    const prevLevel = levelSnap.exists ? levelSnap.data() : { highScore: 0, stars: 0 };

    const deltaScore = Math.max(0, score - (prevLevel.highScore || 0));
    const newCurrent = Math.max(user.currentLevel || 1, level + 1);

    tx.set(levelRef, {
      level,
      highScore: Math.max(score, prevLevel.highScore || 0),
      stars: Math.max(stars, prevLevel.stars || 0),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    tx.set(userRef, {
      uid,
      currentLevel: newCurrent,
      totalScore: (user.totalScore || 0) + deltaScore,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });

  return { ok: true };
});

exports.fetchDashboardData = onCall(async (req) => {
  const uid = requireAuth(req);
  const userRef = db.collection(USERS).doc(uid);
  const [userSnap, levelsSnap] = await Promise.all([
    userRef.get(),
    userRef.collection('levels').orderBy('level').limit(100).get()
  ]);
  return {
    ok: true,
    user: userSnap.exists ? userSnap.data() : null,
    levels: levelsSnap.docs.map((d) => d.data())
  };
});

exports.generateReferralCode = onCall(async (req) => {
  const uid = requireAuth(req);
  const code = uid.slice(0, 6) + '-' + Math.random().toString(36).slice(2, 8);
  await db.collection(REFERRALS).doc(code).set({
    ownerUid: uid,
    redeemedBy: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { ok: true, code };
});


exports.redeemReferralCode = onCall(async (req) => {
  const uid = requireAuth(req);
  const { code } = req.data || {};
  if (!code || typeof code !== 'string') throw new HttpsError('invalid-argument', 'Code required');

  const ref = db.collection(REFERRALS).doc(code.trim());
  const userRef = db.collection(USERS).doc(uid);

  await db.runTransaction(async (tx) => {
    const [refSnap, userSnap] = await Promise.all([tx.get(ref), tx.get(userRef)]);
    if (!refSnap.exists) throw new HttpsError('not-found', 'Referral not found');
    const data = refSnap.data();
    if (data.ownerUid === uid) throw new HttpsError('failed-precondition', 'Cannot redeem own code');
    const redeemedBy = data.redeemedBy || [];
    if (redeemedBy.includes(uid)) throw new HttpsError('already-exists', 'Already redeemed');

    tx.set(ref, { redeemedBy: [...redeemedBy, uid], updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    tx.set(userRef, { boosters: { extraMoves: ((userSnap.data()?.boosters?.extraMoves) || 0) + 5 }, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    const ownerRef = db.collection(USERS).doc(data.ownerUid);
    const ownerSnap = await tx.get(ownerRef);
    tx.set(ownerRef, { boosters: { extraMoves: ((ownerSnap.data()?.boosters?.extraMoves) || 0) + 5 }, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  });

  return { ok: true, reward: '5 Extra Moves' };
});
