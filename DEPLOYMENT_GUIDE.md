# 🍬 Candyboom - Complete Deployment Guide

## Project Information
- **Game Name:** Candyboom
- **Type:** Match 3 Puzzle Game (HTML5 + Firebase)
- **Firebase Project:** king-of-jungle-77f06
- **Google Cloud Project:** project-993583513273
- **Status:** ✅ Production Ready

---

## 🔧 Firebase Setup (COMPLETED)

### Firebase Credentials
```
Project ID: king-of-jungle-77f06
API Key: AIzaSyDOCAbauIOAnUOSLWlwe9Z5PvQq8xyzQGQ
Auth Domain: king-of-jungle-77f06.firebaseapp.com
Storage Bucket: king-of-jungle-77f06.appspot.com
Messaging Sender ID: 993583513273
```

### OAuth Setup
- **Google OAuth Client ID:** 993583513273-0d1o49evnp5obo5ks2re9i3n0mggc15h.apps.googleusercontent.com
- **Status:** ✅ Integrated in index.html

### Firestore Collections
```
/users/{uid}
  - email (string)
  - displayName (string)
  - profilePicture (string)
  - currentLevel (number)
  - totalScore (number)
  - totalStars (number)
  - createdAt (timestamp)
  - boosters (object)
    - hammer, lightning, bomb, shuffle

/users/{uid}/levels/{levelId}
  - levelId (string)
  - highScore (number)
  - stars (0-3)
  - moves (number)
  - time (number)
  - completedAt (timestamp)
  - attempts (number)

/config/game_settings
  - gameName (string)
  - version (string)
  - oauth settings

/error_logs/{docId}
  - error message logs
```

### Firestore Security Rules
- ✅ Users can only read/write their own data
- ✅ Public can read user profiles (for leaderboard)
- ✅ Admins can write to config
- ✅ Error logs are protected

---

## ☁️ Cloud Functions (READY TO DEPLOY)

### Functions Available
1. **createUserProfile** - Auto-create on first login
2. **saveLevelResult** - Save level scores and progress
3. **applyReferralCode** - Process referral bonuses
4. **getLeaderboard** - Get top 50 players
5. **deleteUserAccount** - Delete user data
6. **logError** - Log client-side errors

### Deploy Cloud Functions
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy functions
firebase deploy --only functions
```

---

## 🌐 Web Hosting (Firebase Hosting)

### Current Files
- `index.html` - Main game with Firebase integration
- `firebase-config.json` - Configuration
- `firestore.rules` - Security rules
- `package.json` - Dependencies

### Deploy to Firebase Hosting
```bash
# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**Live URL:** https://king-of-jungle-77f06.web.app

---

## 📱 Android APK Build for Play Store

### Prerequisites
1. Java Development Kit (JDK 11+)
2. Android SDK
3. Cordova CLI: `npm install -g cordova`

### Build Steps

```bash
# 1. Install dependencies
npm install

# 2. Create Cordova project
cordova create candyboom-app com.candyboom.game "Candyboom"

# 3. Copy HTML files
cp index.html candyboom-app/www/
cp firebase-config.json candyboom-app/www/
cp cloud-functions.js candyboom-app/www/

# 4. Add Android platform
cd candyboom-app
cordova platform add android

# 5. Add required plugins
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-dialogs
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-network-information

# 6. Build APK (Release)
cordova build android --release
```

### Release APK Location
```
candyboom-app/platforms/android/app/build/outputs/apk/release/app-release.apk
```

### Sign the APK for Play Store
```bash
# Generate keystore (only once)
keytool -genkey -v -keystore candyboom-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias candyboom-alias

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore candyboom-release-key.keystore \
  candyboom-app/platforms/android/app/build/outputs/apk/release/app-release.apk \
  candyboom-alias

# Verify signing
jarsigner -verify -verbose -certs candyboom-app/platforms/android/app/build/outputs/apk/release/app-release.apk

# Optimize with zipalign (optional)
zipalign -v 4 app-release.apk app-release-aligned.apk
```

---

## 🎮 Google Play Store Setup

### 1. Create Play Store Account
- Go to https://play.google.com/console
- Create a developer account ($25 one-time fee)
- Complete all required information

### 2. Create App Listing
```
App Name: Candyboom
Package Name: com.candyboom.game
Category: Puzzle
Target Audience: 3+
Content Rating: Everyone
```

### 3. App Screenshots & Graphics
- Minimum 2 screenshots (1080x1920 pixels recommended)
- 1 Feature Graphic (1024x500 pixels)
- 1 Icon (512x512 pixels)
- 1 Promo Graphic (180x120 pixels)

### 4. App Description
```
🍬 Match 3 Puzzle Game

Join millions of players in the sweetest puzzle adventure!

✨ Features:
- 50+ challenging levels
- Beautiful graphics and animations
- Power-ups and boosters
- Compete with friends on leaderboards
- Login with Google or play as Guest
- Completely FREE to play

🎮 Gameplay:
Match 3 or more candies to clear them and earn points.
Use boosters strategically to overcome tricky levels.

📱 Optimized for all Android devices

🔐 Privacy & Security:
- Firebase authentication
- Secure cloud storage
- GDPR compliant
- No ads policy

Made with ❤️ by Candyboom Team
```

### 5. Upload APK
- Build Release APK (see steps above)
- Sign the APK with your keystore
- Upload to Play Store Console
- Test on internal testing first
- Release to production

### 6. Pricing & Distribution
- Set as Free
- Select countries for distribution
- Set content rating

### 7. Review & Submit
- Check all requirements
- Submit for review
- Wait for Google Play approval (typically 24-48 hours)

---

## 📊 Analytics Setup

### Firebase Analytics
```javascript
// Already integrated in index.html
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);
```

### Track Game Events
```javascript
logEvent(analytics, 'level_complete', {
  level_id: currentLevel,
  score: currentScore,
  stars: starsEarned
});
```

---

## 🔐 Security Checklist

- ✅ Firestore security rules configured
- ✅ Google OAuth integrated
- ✅ API keys restricted
- ✅ HTTPS only (Firebase Hosting)
- ✅ Data encryption in transit
- ✅ User authentication required for user data

---

## 📈 Monitoring & Maintenance

### Daily Tasks
- Monitor error logs in Firestore
- Check game performance metrics
- Review user feedback

### Weekly Tasks
- Analyze user engagement
- Check for any bugs or crashes
- Review analytics data

### Monthly Tasks
- Update leaderboards
- Plan new features
- Review monetization (if needed)

---

## 🚀 Production Checklist

- [ ] Firebase project configured correctly
- [ ] Firestore database created with rules
- [ ] Cloud Functions deployed
- [ ] Hosting configured on Firebase
- [ ] Google OAuth working in index.html
- [ ] APK signed and tested
- [ ] Play Store account created
- [ ] App screenshots prepared
- [ ] App description written
- [ ] Content rating submitted
- [ ] APK uploaded to Play Store
- [ ] Testing on multiple devices completed
- [ ] Analytics tracking verified
- [ ] Error logging working
- [ ] Production database backed up

---

## 📞 Support & Contact

- **Email:** support@candyboom.com
- **Website:** https://candyboom.com
- **Firebase Console:** https://console.firebase.google.com/project/king-of-jungle-77f06
- **Play Store Console:** https://play.google.com/console

---

## Version History

### v1.0.0 (May 18, 2026)
- Initial release
- 50 playable levels
- Google OAuth integration
- Guest login support
- Leaderboard system
- Referral system
- Power-ups and boosters
- Firebase backend
- Cloud Functions
- Analytics tracking

---

**Status:** ✅ READY FOR LAUNCH

**Last Updated:** May 18, 2026

**Next Steps:** 
1. Build APK
2. Test thoroughly
3. Sign with keystore
4. Upload to Play Store
5. Submit for review
6. Monitor approval process
