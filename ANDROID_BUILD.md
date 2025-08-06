# Android APK Build Guide

This guide explains how to build Android APK files for the Blacktop Blackout application using Capacitor.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Android Studio** with Android SDK
3. **Java Development Kit (JDK)** 8 or 11
4. **Gradle** (usually included with Android Studio)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build APK (Production)
```bash
npm run apk:build
```

### 3. Build APK (Debug)
```bash
npm run apk:debug
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run mobile:build` | Build web app and sync with Capacitor |
| `npm run mobile:android` | Open Android project in Android Studio |
| `npm run mobile:run-android` | Run app on connected Android device/emulator |
| `npm run apk:build` | Build production APK |
| `npm run apk:debug` | Build debug APK |
| `npm run android:setup` | Initial Android platform setup |

## Manual Build Process

### 1. Build the Web Application
```bash
cd apps/web-app
npm run build
cd ../..
```

### 2. Sync with Capacitor
```bash
npx cap sync
```

### 3. Open in Android Studio
```bash
npx cap open android
```

### 4. Build APK in Android Studio
1. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Wait for the build to complete
3. Click **locate** to find the generated APK file

## Build Configuration

The APK configuration is managed through:

- `capacitor.config.ts` - Main Capacitor configuration
- `android/app/build.gradle` - Android-specific build settings
- `android/variables.gradle` - SDK versions and dependencies

## Environment Variables

Create a `.env` file in the web-app directory for environment-specific settings:

```env
VITE_API_URL=https://your-api-url.com
VITE_WEATHER_API_KEY=your-weather-api-key
```

## Troubleshooting

### Common Issues

1. **Build fails with "SDK not found"**
   - Ensure Android Studio is properly installed
   - Set `ANDROID_HOME` environment variable
   - Add Android SDK tools to PATH

2. **Gradle build fails**
   - Update Gradle version in `android/gradle/wrapper/gradle-wrapper.properties`
   - Clean and rebuild: `./gradlew clean` then `./gradlew build`

3. **App crashes on startup**
   - Check logs with: `npx cap run android --device`
   - Verify all plugins are properly installed

### Useful Commands

```bash
# Check Capacitor doctor for setup issues
npx cap doctor

# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest

# Clear cache and rebuild
npx cap sync --force

# View device logs
npx cap run android --device --livereload
```

## APK Output Location

Built APKs can be found at:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

## Signing APK for Release

For production releases, you'll need to sign the APK:

1. Generate a signing key
2. Configure signing in `android/app/build.gradle`
3. Build signed APK through Android Studio

## Next Steps

- Set up CI/CD pipeline for automated builds
- Configure app signing for Google Play Store
- Add native Android plugins as needed
- Optimize build performance and app size