# Gallery: Android app

The web app lives in `www/` (same files as the PWA). Capacitor wraps it as a real Android app that works fully offline.

## A. Get an APK on your phone today (no Android Studio)
1. Create a free GitHub account, make a new repository, and upload everything in this folder (keep the `.github` folder).
2. Open the repo's **Actions** tab, choose **Build Android APK**, then **Run workflow**.
3. When it finishes (about 5 minutes), download the `gallery-debug-apk` artifact, unzip it, and send `app-debug.apk` to your phone.
4. Open it on the phone and allow "install unknown apps". Done.

## B. Publish on Google Play (needs a release AAB)
1. Change `appId` in `capacitor.config.json` to your own unique id (for example `com.anshul.gallery`). It can never change after publishing.
2. Install Android Studio and Node 20, then in this folder run:
   `npm install`, `npx cap add android`, `npx cap sync android`, `npx cap open android`
3. Set your icon: add a 1024x1024 `assets/icon-only.png`, then run `npx @capacitor/assets generate --android`.
4. In Android Studio choose **Build > Generate Signed Bundle / APK > Android App Bundle**. Create a keystore and keep it and its passwords safe forever, because you need them for every update.
5. Upload the `.aab` in the Play Console.

### Play Console checklist
- One-time $25 developer registration. New personal accounts must run a closed test with at least 12 testers for 14 days before they can go to production.
- Store listing: 512x512 icon, 1024x500 feature graphic, 2 to 8 phone screenshots, short and full description.
- A privacy policy URL (say that photos stay on the device and nothing is uploaded), the Data safety form, and the content rating questionnaire.
- Do not use the name "Samsung" or "One UI" in the app name, icon or listing.

## After changing the app
Edit files in `www/`, run `npx cap sync android`, and rebuild. Raise `versionCode` in `android/app/build.gradle` for every Play upload.
