# Aries Mobile Agent React Native
Aries Mobile Agent React Native is an open source Aries mobile agent app. This is a project that has been created to focus the community's efforts towards a central open source project. Various different organizations and people have expressed interest in a open source community project to help focus efforts to help prevent duplication of work between projects. Aries Bifold is also intended to help get complex or specific use-case projects started faster by cloning and having a basis of an Aries agent.

## Code
This project utilizes [Aries Framework Javascript (AFJ)](https://github.com/hyperledger/aries-framework-javascript) and [rn-indy-sdk](https://github.com/AbsaOSS/rn-indy-sdk).

This project is intended to be contributed to Hyperledger after the initial conversations regarding the project within the community

## Community
Indicio has organized [working group calls](https://wiki.hyperledger.org/display/ARIES/Aries+Bifold+User+Group+Meetings) for community discussions on the project on every other Wednesdays. 
Everyone is more than welcome to attend and contribute at the working group call.

Indicio has provided existing code, but we really want to make this into a community effort.

## Project State
### Platform

Aries Bifold currently is built on React Native 0.61.5. Newer versions of React Native experience issues with ZMQ (Fatal Signal 6 (SIGABRT)). We are making efforts to be able to move to React Native 0.63.4.

As of now Aries Bifold targets Android API 29.0.3, with plans to support API 30 soon. 

IOS support is being actively being worked on.


### Testing
Aries Mobile Agent React Native aims to utilize the [Aries Protocols Test Suite (APTS)](https://github.com/hyperledger/aries-protocol-test-suite) and potentially the [Aries Agent Test Harness (AATH)](https://github.com/hyperledger/aries-agent-test-harness) to test for Aries Agent compatibility and interoperability.

## Running the App
### APKs
Generated APKs can be found in each github release, with further discussion regarding App Stores and the strategy/desires around that.

### App Development Setup

#### Android Setup
Clone the app:
```
git clone https://github.com/Indicio-tech/aries-mobileagent-react-native
cd aries-mobileagent-react-native
npm install 
```

Run the App on a connected device or emulator:
```
npm run start
```
In another terminal, run:
```
npm run android
```

You have now set up the app for development!

#### iOS Setup
TODO: Update Documentation

## Troubleshooting

#### Hot Reloading
Hot reloading may not work correctly with instantiated Agent objects. Reloading (`r`) will work. Any changes made to native modules require you to re-run `npm run android`.

#### Mediator ID Issues
There is a known issue that while in development that doesn't open a new wallet, which causes issues with the Mediator IDs. You can work around this issue by closing the app and reopening the app when refreshing changes. Fixes are in progress to address this.

#### Dependency Issues, Native Module Linking Issues, or Usage Issues
If you end up changing dependencies or structures, you may need to perform the following steps:

##### Android

```
rm -rf node_modules
npm install
```

Clean the Android build:
```
cd android
./gradlew clean
cd ..
```

Start and clean the Metro cache:
```
npm run start
```

In your second terminal, you can now run:
```
npx react-native run-android
```

## License

[Apache License Version 2.0](./LICENSE)