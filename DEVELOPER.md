# Developers Guide

* [Prerequisite software](#prerequisite-software)

## Prerequisite software

Before you can proceed with building and testing the BC Wallet app, you must install and configure the
following products on your development machine:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org) - (version specified in the `engines` field
  of [./package.json](./package.json))
* [yarn 3](https://yarnpkg.com/) - (version specified in the `engines` field
  of [./package.json](./package.json))
* Java 11
* Android Studio
    * cmake 3.22.1
    * ndk 25.1.8937393

If you are using Mac OS with ARM64 chip, see this [suggested setup](./DEVELOPER_MACOS_arm64.md)


## React Native setup
React Native environment setup instructions are documented [here](https://reactnative.dev/docs/environment-setup). Be sure to select the correct React Native version (currently 0.66.x) from the dropdown. This will guide you through setting up your development environment for your operating system and choice of iOS (only if you are using a Mac) or Android. 

## Installing dependencies
Next, install the npm modules needed to build and test the app.
```sh
# from the root of the cloned repository, run:
yarn install
```

## Building packages
Some packages need to be build, transpiled befoer it can be uses from the app
```sh
# from the root of the cloned repository, run:
yarn run prepare
```

## Running in an Android emulator
During the development process, you may want to run the app in the emulator to see see what it looks like or for some manual testing.

Setting up Android studio and emulator might be different for each OS.
See the [suggested Mac OS arm64 setup](./DEVELOPER_MACOS_arm64.md)

If you have done the setup correctly, you should be able to start the emulator by running:
```sh
emulator -avd Pixel_6_API_31 -netdelay none -netspeed full
```

### Running app in Android emulator with Metro

Once you've created and configured your emulator:

```sh
# from the root of the cloned repository, run:
yarn workspace aries-bifold-app run android
```