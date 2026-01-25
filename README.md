# App Overview

## Problem
Individuals with limited disposable income struggle to consistently track their expenses and budgets because existing finance tracking apps rely on tedious manual input and lack motivating or intelligent features that make the process quick and engaging.
This app is a modern booking and scheduling platform designed to make court reservations fast, intuitive, and reliable.

## Solution
Users need an engaging system that reduces the effort required to log expenses accurately by simplifying the user input using AI (through voice / natural language / image input )


## Demo & Walkthrough Videos

- App Overview & Features  
[![Talkcents app overview](https://img.youtube.com/vi/fIcpqebRTxk/hqdefault.jpg)](https://youtube.com/shorts/fIcpqebRTxk)

Link: https://youtube.com/shorts/fIcpqebRTxk

## Things to take note (if using react native for the first time)

You might need to install JDK 17 for android version to run  
You might need to have a local.properties file under ./android/ if you do not have ANDROID_HOME set up  
You might need to add platform tools to path to run android for react native to use android debug bridge  
Moved the default App.tsx code to ./src/screens/Tutorial.tsx for reference  
Added .gitkeep placeholders to push folders

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.
