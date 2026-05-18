# Candyboom / King of Jungle

This repository now includes a working Firebase backend scaffold for user auth/profile, level progress saving, and referral code generation.

## What is included

- Static game frontend (`index.html`, `game.html`)
- Firebase Cloud Functions backend in `functions/src/index.js`
- Firestore security rules (`firestore.rules`)
- Firestore indexes (`firestore.indexes.json`)
- Firebase project config (`firebase.json`)

## Backend functions

- `createOrInitUserProfile` (callable)
- `saveLevelResult` (callable)
- `fetchDashboardData` (callable)
- `generateReferralCode` (callable)

## Quick start

1. Install Firebase CLI and login.
2. Install dependencies:
   ```bash
   cd functions
   npm install
   ```
3. From repo root, deploy:
   ```bash
   firebase deploy --only functions,firestore:rules,firestore:indexes
   ```

## Data model

- `/users/{uid}`
  - `uid`, `currentLevel`, `totalScore`, `boosters`, timestamps
- `/users/{uid}/levels/{level}`
  - `level`, `highScore`, `stars`, `updatedAt`
- `/referrals/{code}`
  - `ownerUid`, `redeemedBy[]`, `createdAt`
