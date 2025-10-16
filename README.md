# Bifold README.md

# Summary

The Bifold Wallet is an open-source project designed to enhance the way we interact with digital identities, making the process both secure and user-friendly. It is based on React Native, which lets it run smoothly on different devices and platforms, such as iOS, and Android. It is a leading example of digital wallets, with a focus on making verifiable credentials (VCs) simple and convenient for everyone. Our mission is to create a collaborative community that enhances the way digital credentials are handled, making them accessible and straightforward for all.

**Key Features and Benefits:**

- **Unified Digital Identity Management:** Emphasizing security and user-friendliness, Bifold excels in consolidating and managing digital identities across various standards like AnonCreds and W3C VC Data Model. This capability positions Bifold as a pivotal resource for secure and private handling of digital identities, accessible to all.

- **Seamless Multi-Platform Use:** Thanks to its React Native architecture, Bifold delivers a smooth experience on any device, enabling users to manage their digital identities whether they are using a phone or a tablet. This cross-platform flexibility means that developers can create applications once and deploy them on both iOS and Android, ensuring a consistent and accessible user experience.

- **Community-Driven Development:** Bifold is more than a tool; it's a community initiative aimed at fostering collaboration and sharing innovations. By bringing together diverse groups, from organizations to individuals, Bifold encourages the pooling of resources and knowledge to facilitate the broader adoption and understanding of verifiable credentials.

- **Widespread Adoption and Trust:** With a growing list of users around the globe, including governmental bodies in Canada and teams in Brazil, Bifold has proven its reliability and relevance. Its international use showcases the platform's adaptability to various needs and its role in advancing digital identity management on a global scale.

- **Adaptability to Diverse Needs:** Bifold's design caters to a wide range of project types and complexities, offering tailored solutions for managing digital identities. This adaptability ensures that users can streamline their processes related to verifiable credentials, improving efficiency and simplification in digital identity initiatives.

# Current Status

Currently, we're updating Bifold's architecture to make it easier to maintain and customize for various use cases. Check out our [design roadmap issue](https://github.com/openwallet-foundation/bifold-wallet/issues/754) for more information, and we welcome your feedback.

## Contributing

We warmly welcome contributions to the Bifold project! If you're interested in joining our community, please start by reading our [Contributor's Guide][contributor-guide].

## Community

Joining the Bifold community on OpenWallet Foundation Discord is a breeze:

1. Head to https://discord.gg/openwalletfoundation
2. Click on 'Accept the invite'
3. Dive into the various channels!

`#bifold` is our main discussion channel for everything Bifold wallet related. And since Bifold uses Credo (formerly Aries Framework Javascript) extensively, you might also want to join the `#credo` channel for deeper technical conversations. We can't wait to see you there!

Additionally, we hold a bi-weekly user group meeting. You can find the updated schedule, past agendas, and meeting recordings on this [wiki page](https://wiki.openwallet.foundation/display/BIFOLD/).

Please note, being part of the OpenWallet Foundation, we expect all interactions to adhere to the [Antitrust Policy](https://wiki.hyperledger.org/download/attachments/29034696/Antitrustnotice.png?version=1&modificationDate=1581695654000&api=v2) and [Code of Conduct][code-of-conduct].

# Developers Guide

The following document is intended to help developers get started with the Bifold project. It includes information on how to set up your development environment, build the project, and run the app in an emulator.

## Project Overview

The Bifold Wallet is a user-friendly mobile agent that is built with React Native and uses Credo to exchange verifiable credentials with other agents. While Credo handles the heavy lifting of verifiable credential work, Bifold focuses on user experience and interactions with these credentials.

Key points to note:

- Bifold uses the Credo library, which in turn uses Rust libraries.
- Credo uses the HTTP protocol to communicate with Aries agents and WebSockets for messaging via a mediator.
- Bifold relies on a mediator because mobile devices don't have a fixed IP address and often don't accept inbound network connections. The mediator, a service that runs on a server with a fixed IP address, relays messages between an agent and Bifold. The mediator is configured within the Bifold app.

## Setup

The setup for Bifold is similar to other React Native projects. The following sections will walk you through the process of setting up your development environment, installing dependencies, and running the app in an emulator.

### Prerequisites

[Android Studio](https://developer.android.com/studio)
[Apple Xcode](https://developer.apple.com/xcode/)

Since this is a mobile development project, this project is primarily developed on MacOS, support for Windows/Linux is quite limited 

## Suggested Setup

1.  Install [Homebrew](https://brew.sh/)

    ```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

    Follow post installation instructions. The following should be added to your `~/.zshrc`

    ```sh
    # Set PATH, MANPATH, etc., for Homebrew.
    eval "$(/opt/homebrew/bin/brew shellenv)"
    ```

    IMPORTANT: close and start a new terminal session

2.  Install Watchman

    ```
    brew install watchman
    ```

3.  Install NVM
    ```
    brew install nvm
    ```
    Follow post installation instructions. The following should be added to your `~/.zshrc`
    ```sh
    source $(brew --prefix nvm)/nvm.sh
    ```
4.  Install Node (use the version from the GitHub Actions)

    ```sh
    nvm install 20.19.2
    ```

    Activate node version by adding the following to your `~/.zshrc`

    ```sh
    source $(brew --prefix nvm)/nvm.sh
    nvm use 20.19.2
    ```

5.  Install Yarn
    ```sh
    corepack enable
    corepack prepare yarn@4.9.2 --activate
    ```
    IMPORTANT: Check `packageManager` for the exact and up-todate version in the root [package.json](./package.json)
6.  Manually Download and Install Android Studio as per documentation:
    https://developer.android.com/studio

        1. Setup Android SDK by adding the following to your `~/.zshrc`
            ```sh
            # The ordering is important!!!
            export ANDROID_HOME=$HOME/Library/Android/sdk
            export PATH=$PATH:$ANDROID_HOME/emulator
            export PATH=$PATH:$ANDROID_HOME/tools
            export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
            export PATH=$PATH:$ANDROID_HOME/tools/bin
            export PATH=$PATH:$ANDROID_HOME/platform-tools
            ```
            IMPORTANT: close and start a new terminal session
        2. Install additional build tools
            ```sh
            sdkmanager --install "emulator" "build-tools;31.0.0" "cmake;3.22.1" "platforms;android-31" "ndk;25.1.8937393" "system-images;android-31;google_apis;arm64-v8a"
            ```
        3. Setup Build Tools
            ```sh
            export PATH=$PATH:$ANDROID_HOME/cmake/3.22.1/bin
            ```
        4. Create Android Virtual Device (AVD)
            ```sh
            avdmanager --verbose create avd --force --name Pixel_6_API_31 --device "pixel_6" --package "system-images;android-31;google_apis;arm64-v8a" --tag "google_apis" --abi "arm64-v8a"
            ```
        5. Start Emulator (AVD)
            ```sh
            emulator -avd Pixel_6_API_31 -netdelay none -netspeed full
            ```

7.  Install and Activate Java
    1. Install Java
       ```sh
       brew install --cask zulu@17
       ```
    1. Activate Java by adding the following to your `~/.zshrc`
       ```sh
       # check output of /usr/libexec/java_home -V
       alias java17="export JAVA_HOME=\"/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home\""
       java17 # optional if you want to have Java 17 always enabled by default
       ```
       IMPORTANT: close and start a new terminal session

**ProTip 🤓**

You can use [mise-en-place](https://mise.jdx.dev/getting-started.html) to easily configure the development tools for this project. Once mise is setup simply run 

```sh
mise install
```

### Configuration for All Platforms

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
MEDIATOR_URL=https://us-east.public.mediator.indiciotech.io/message?oob=eyJAaWQiOiJlOTFkZmYxOC1mYzIwLTRkMjItYjljMi1jMzZhZDI0ZTYwODEiLCJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJoYW5kc2hha2VfcHJvdG9jb2xzIjpbImh0dHBzOi8vZGlkY29tbS5vcmcvZGlkZXhjaGFuZ2UvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa2dTWUJNNjNpSE5laVQyVlNRdTdiYnRYaEdZQ1FyUEo4dUVHdXJiZkdiYmdFIl0sInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vdXMtZWFzdC5wdWJsaWMubWVkaWF0b3IuaW5kaWNpb3RlY2guaW8vbWVzc2FnZSJ9LHsiaWQiOiIjaW5saW5lIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtnU1lCTTYzaUhOZWlUMlZTUXU3YmJ0WGhHWUNRclBKOHVFR3VyYmZHYmJnRSJdLCJzZXJ2aWNlRW5kcG9pbnQiOiJ3c3M6Ly93cy51cy1lYXN0LnB1YmxpYy5tZWRpYXRvci5pbmRpY2lvdGVjaC5pby93cyJ9XSwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwibGFiZWwiOiJDbG91ZCBNZWRpYXRvciJ9
```

You can use the above mentioned public mediator hosted by Indecio or set up your own mediator. See [Aries Mediator](https://github.com/hyperledger/aries-mediator-service) for more information.

### Custom Mediators in Bifold

Bifold wallet supports using custom mediators. To succesfully add a mediator to the wallet for use, the mediator invitation must contain a goal code field with the value:

```text
"aries.vc.mediate"
```

Currently the way to add a custom mediator is by scanning a QR code containing the invitation URL. This will take you to a settings screen in the developer options allowing you to select which mediator to connect to.

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

## Running Bifold on an iOS Device

To develop for iOS, you'll need a Mac with Xcode installed and potentially a developer team membership to execute Bifold on your device.

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

# Success Stories

The organizations or jurisdictions listed below have either deployed a project based on Bifold, are currently assessing the technology, or are actively developing a solution. If you want your organization to be included in this list, please submit a Pull Request against this README.md.

- [BC Wallet](https://apps.apple.com/us/app/bc-wallet/id1587380443)

The BC Wallet is a digital wallet app developed by the Government of British Columbia.

[contributor-guide]: ./CONTRIBUTING
[developers-guide]: ./DEVELOPER.md
[code-of-conduct]: ./CODE_OF_CONDUCT.md
