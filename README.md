# Candyboom / King of Jungle

Modernized working scaffold with:
- Landing page auth modal toggle (Google/Facebook/Guest)
- Firebase callable backend for profile/progress/invite
- Game page wired with profile sync, cloud progress save, and share invite link

## Configure Firebase (required)
Update Firebase config in:
- `index.html` (module script firebaseConfig)
- `game.html` (module script firebaseConfig)

## Backend callables
- `createOrInitUserProfile`
- `saveLevelResult`
- `fetchDashboardData`
- `generateReferralCode`
- `redeemReferralCode`

## Deploy
```bash
cd functions && npm install
cd ..
firebase deploy --only functions,firestore:rules,firestore:indexes
```

## Notes
- Login button on landing now opens auth modal.
- Invite link is generated for logged-in user.
- Game saves level result to Firestore on level clear.
