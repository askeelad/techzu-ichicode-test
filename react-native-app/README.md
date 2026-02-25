# Mini Social Feed App - React Native

A fully-featured mobile application built with React Native and Expo Router, featuring an infinitely scrolling feed, real-time push notifications, and a bottom sheet comment system.

## Getting Started

This app uses Expo to make cross-platform development easy and seamless.

### Prerequisites
- Node.js (v20+)
- Expo CLI
- An Android Emulator / iOS Simulator, OR the Expo Go app on your physical device.

### 1. Installation

Navigate to the `react-native-app` directory and install the dependencies:
```bash
npm install
```

### 2. Environment Variables

Create a `.env` file based on the example:
```bash
cp .env.example .env
```
Ensure `EXPO_PUBLIC_API_URL` points to your backend. If running the backend on your laptop and testing on an actual physical Android phone, you MUST replace `localhost` with your laptop's local IP address (e.g., `http://192.168.0.x:3000/api/v1`).

### 3. Start the Application

Start the Expo Metro Bundler:
```bash
npm start
```
- Press `a` to open on an Android emulator.
- Press `i` to open on an iOS simulator.
- Scan the QR code with your physical device's camera to open it directly on your phone using Expo Go.

### Note on Caching
If you ever change a layout folder name or remove a navigation tab (e.g., removing the Notifications tab) and it doesn't update, clear the Metro cache by running:
```bash
npm start -c
```

## Firebase Push Notifications Setup

This app utilizes Firebase Cloud Messaging (FCM) through Expo Notifications. Setting this up requires a few important steps.

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Click the **Android icon** to add an Android app to the project.
4. Enter `com.yourusername.reactnativeapp` as the Android package name (this must match the `package` name in `react-native-app/app.json`).
5. Download the `google-services.json` file.

### Step 2: Add `google-services.json` to the App
Move the downloaded `google-services.json` file into the root of the `react-native-app/` directory (alongside `app.json`). This file contains the API keys your phone needs to listen for push notifications.

### Step 3: Configure the Expo Project ID
Expo needs a unique project ID to generate Push Tokens.

1. Create a free account at [Expo.dev](https://expo.dev).
2. Login to the Expo CLI in your terminal:
   ```bash
   npx expo login
   ```
3. Initialize the project to associate it with your account and generate a Project ID:
   ```bash
   npx eas-cli project:init
   ```
4. This will automatically add an `eas.projectId` inside your `app.json`. Make sure this ID is also copied to your `EXPO_PUBLIC_PROJECT_ID` variable in the `.env` file if you are running a bare workflow build.

### Step 4: Backend Integration
Finally, the backend needs permission to send notifications to your Firebase project.
1. In the Firebase Console, go to **Project Settings > Service Accounts**.
2. Click **Generate New Private Key** to download a JSON file containing admin credentials.
3. Open your backend's `.env` file and fill in `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY` (ensure you keep the `\n` newlines just as they appear in the JSON), and `FIREBASE_CLIENT_EMAIL` using the values from that downloaded file.

## Building the APK

To build a standalone `.apk` file for Android devices Without Expo Go:

1. Ensure you have an Expo account and are logged in via `npx expo login`.
2. Run the EAS build command for Android:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
3. Wait for the build to finish on Expo's servers. It will provide a download link to your `.apk`!
