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


## SQL schema (for relational backend)

If you want to run the same data model on SQL (for example Cloud SQL Postgres), this repo now includes `schema.sql` that maps the following entities:

- `User` -> `users`
- `Level` -> `levels`
- `GameSession` -> `game_sessions`
- `PowerUp` -> `power_ups`
- `UserPowerUp` -> `user_power_ups` (composite primary key)

Apply it with:

```bash
psql "$DATABASE_URL" -f schema.sql
```


## Firebase Hosting build setup

Hosting now deploys a generated `dist/` directory instead of the repository root.

- Build script: `scripts/build-hosting.sh`
- Copied into `dist/`: `index.html`, `game.html`, and `levels/`
- Deploy command (from repo root):

```bash
firebase deploy --only hosting
```

You can also run the build manually:

```bash
bash ./scripts/build-hosting.sh
```

## Android Firebase setup (Gradle + google-services)

If your Android app package is `Game.wildsaura.com` and uses Firebase Analytics, configure it as follows.

1. Save the Firebase Android config as `app/google-services.json`:

```json
{
  "project_info": {
    "project_number": "993583513273",
    "project_id": "king-of-jungle-77f06",
    "storage_bucket": "king-of-jungle-77f06.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:993583513273:android:c160d4bd3bd03dd63ba568",
        "android_client_info": {
          "package_name": "Game.wildsaura.com"
        }
      },
      "oauth_client": [],
      "api_key": [
        {
          "current_key": "AIzaSyD3oDgYNVRVp_uRfOChMCLOTawTfZIJFRc"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

2. In your root `build.gradle(.kts)` plugins block:

```kts
id("com.google.gms.google-services") version "4.4.4" apply false
```

3. In your app module `build.gradle(.kts)` plugins block:

```kts
id("com.android.application")
id("com.google.gms.google-services")
```

4. Add Firebase BoM and Analytics dependency in your app module:

```kts
implementation(platform("com.google.firebase:firebase-bom:34.13.0"))
implementation("com.google.firebase:firebase-analytics")
```
