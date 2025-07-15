# Developers Guide

The following document is intended to help developers get started with the Bifold project. It includes information on how to set up your development environment, build the project, and run the app in an emulator.

# Project Overview

The Bifold Wallet is a user-friendly mobile agent that is built with React Native and uses Credo to exchange verifiable credentials with other agents. While Credo handles the heavy lifting of verifiable credential work, Bifold focuses on user experience and interactions with these credentials.

Key points to note:

- Bifold uses the Credo library, which in turn uses Rust libraries.
- Credo uses the HTTP protocol to communicate with Aries agents and WebSockets for messaging via a mediator.
- Bifold relies on a mediator because mobile devices don't have a fixed IP address and often don't accept inbound network connections. The mediator, a service that runs on a server with a fixed IP address, relays messages between an agent and Bifold. The mediator is configured within the Bifold app.

## Setup

The setup for Bifold is similar to other React Native projects. The following sections will walk you through the process of setting up your development environment, installing dependencies, and running the app in an emulator.

### Prerequisites

This is a [yarn](https://yarnpkg.com) based project, not [npm](https://www.npmjs.com/). You will need to install yarn if you don't already have it installed. Also, you will need a version of node that is compatible with the version of yarn specified in the `engines` field of [./package.json](./package.json). If you don't have a compatible version of node installed, you can use [nvm](https://github.com/nvm-sh/nvm) to install a compatible version of node.

```sh
npm install -g yarn
nvm install 20.19.2
```

This project will need to run on an iOS device or Android device or emulator. While it is recommended to test your software on both, especially if you're contributing back to the project, for demonstration purposes you can choose one or the other.

[Android Studio](https://developer.android.com/studio)
[Apple Xcode](https://developer.apple.com/xcode/)

**ProTip 🤓**

If you are using Mac OS with ARM64 chip, see this [suggested setup](./DEVELOPER_MACOS_arm64.md)

### Setup & Configure for All Platforms

Start by cloning the repository:

```sh
git clone https://github.com/openwallet-foundation/bifold-wallet.git bifold \ &&
cd bifold
```

Install all the package dependencies by running the following command from the root of the cloned repository:

```sh
yarn install
```

Some packages need to be built (transpiled) before they can be used from the app. Do this with the following command:

```sh
yarn run build
```

As noted above Bifold requires a mediator to communicate with other Agents. For development purposes, this can be set by creating a `.env` file in the following directory:

```sh
touch samples/app/.env
```

Add a line to the `.env` file with the following content:

```text
MEDIATOR_URL=https://public.mediator.indiciotech.io?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiMDVlYzM5NDItYTEyOS00YWE3LWEzZDQtYTJmNDgwYzNjZThhIiwgInNlcnZpY2VFbmRwb2ludCI6ICJodHRwczovL3B1YmxpYy5tZWRpYXRvci5pbmRpY2lvdGVjaC5pbyIsICJyZWNpcGllbnRLZXlzIjogWyJDc2dIQVpxSktuWlRmc3h0MmRIR3JjN3U2M3ljeFlEZ25RdEZMeFhpeDIzYiJdLCAibGFiZWwiOiAiSW5kaWNpbyBQdWJsaWMgTWVkaWF0b3IifQ==
```

You can use the above mentioned public mediator hosted by Indecio or set up your own mediator. See [Aries Mediator](https://github.com/hyperledger/aries-mediator-service) for more information.

# Running Bifold

## Running Bifold on an Android Device or Emulator

The simplest way to run Bifold on Android is via Android Studio. Here's how:

1. Open Android Studio.
2. Select `File -> Open` and navigate to the `samples/app/android` directory. This will load the project into Android Studio.
3. Run the app on a connected device or emulator by selecting one from the list and clicking the green 'Play' button.

If you prefer using the command line interface (CLI), follow these steps:

### For Linux

(Note: The following instructions assume you have Android Studio and the Android SDK installed in your home directory. If your setup is different, adjust the paths accordingly.)

#### Android SDK

You will need to have the Android SDK installed. You can install it using your package manager or download it from the [Android Studio](https://developer.android.com/studio) website.

Then make sure you have ANDROID_HOME environment variable set to the Android SDK directory:

```sh
export ANDROID_HOME=~/Android/Sdk
```

For more detailed information how to setup android SDK in react native, please refer to the [React Native Android SDK Setup](https://reactnative.dev/docs/set-up-your-environment#android-sdk) documentation.

#### OpenJDK17

You will need to have OpenJDK 17 installed. You can install it using your package manager. 

##### Manual Installation

Some linux distros, such as Kali, might not have OpenJDK 17 available. The instructions below mentions `zulu-17.jdk`, which is a OpenJDK 17 distribution that can be downloaded from [Zulu OpenJDK](https://www.azul.com/downloads/?package=jdk#zulu). You can then run `sudo dpkg -i zulu17.58.21-ca-jdk17.0.15-linux_amd64.deb
` to install it.

If you have more than one version installed, you can run the following command to pick openJDK17 version:

```sh
sudo update-alternatives --config java
```

1. List the available emulators:

   ```sh
   ~/Android/Sdk/emulator/emulator -list-avds
   ```

   If no emulators are listed, check the Android Studio documentation to set up an emulator.

**ProTip 🤓**

Don't use the emulator located at `~/Android/Sdk/tools/emulator` its older, deprecated, and will probably complain about missing the x86 emulator for newer SDK versions.

2. Start an emulator from the list:

   ```sh
   ~/Android/Sdk/emulator/emulator -avd Pixel_5_API_25 -netdelay none -netspeed full
   ```

**ProTip 🤓**

Use `-partition-size 1024` to increase the size of the emulator's data partition. This is useful if you're running the app in the emulator for an extended period of time.

3. Start Metro, the React Native packager:

   ```sh
   cd samples/app
   yarn start
   ```

4. Make sure you have the `JAVA_HOME` environment variable set correctly:

   ```sh
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
   ```

5. Allow the Android emulator to communicate with Metro on port `tcp:8097`:

   ```sh
   ~/Android/Sdk/platform-tools/adb reverse tcp:8081 tcp:8081
   ```

6. Finally, run the app in the emulator:

   ```sh
   cd samples/app
   yarn run android
   ```

This will launch Bifold on your selected Android emulator for development and testing.

### For MacOS

TBD - Help Wanted

### For Windows

TBD - Help Wanted

## Running Bifold on an iOS Device

Please note, you can't run the iOS version of Bifold on an iOS simulator – it must be run on an actual iOS device. To develop for iOS, you'll need a Mac with Xcode installed and potentially a developer team membership to execute Bifold on your device.

The easiest way to run Bifold on an iOS device is through Xcode, as outlined below:

1. Install the [Cocoapods](https://cocoapods.org/) package manager. You can use brew or any method you prefer:

```sh
brew install cocoapods
```

2. Install the necessary dependencies:

```sh
cd samples/app/ios
pod install
```

3. Open the workspace (not the project file) in Xcode:

```sh
open samples/app/ios/AriesBifold.xcworkspace
```

4. In Xcode, select your device, development team, and (if necessary) your Bundle ID. Note: Detailing these steps is beyond the scope of this guide.

5. Run the app on your device by clicking the 'Play' button in Xcode. This will launch Bifold on your selected iOS device for development and testing. It will also launch Metro, the React Native packager, in a separate terminal window. If you prefer to do this manually use the following command:

```sh
cd samples/app
yarn start
```
