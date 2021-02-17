# Aries Bifold (Proposed Project Name)
Aries Bifold is an open source Aries mobile agent app. This is a project that has been created to focus the community's efforts towards a central open source project. Various different organizations and people have expressed interest in a open source community project to help focus efforts to help prevent duplication of work between projects. Aries Bifold is also intended to help get complex or specific use-case projects started faster by cloning and having a basis of an Aries agent.

## Code
The code present in this repo and the [mobile agent library](https://github.com/Indicio-tech/aries-mobileagent-react-native) that Aries Bifold relies on has not been polished and not very mature. Indicio found the urgency for a community project to focus our efforts very compelling to contribute the code even without the polish we give to our work.

This project is intended to be contributed to Hyperledger after the initial conversations regarding the project within the community

## Naming
For this mobile app, Indicio was unable to find a suitable star name (a nod to the awesome Aries Askar name), but would propose 'Aries Bifold'. We are looking for community thoughts and ideas, and are only bringing this one idea to the table for discussion.

### Mobile Library
Aries Bifold relies on a [mobile agent library](https://github.com/Indicio-tech/aries-mobileagent-react-native). This library, following current community conventions, was named Aries Mobile Agent React Native (AMA-RN). However, developed in parallel, separately from Animo, is the project [Aries Mobile Agent React Native](https://github.com/animo/aries-mobile-agent-react-native). So, this library needs a different name, and would benefit from some community discussion as to project name conventions as additional projects begin to be created within the community.

## Community
Indicio has scheduled a [working group call](https://wiki.hyperledger.org/display/ARIES/Aries+Bifold+User+Group+Meetings) to kick off the community discussions on the project on Wednesday, 2-24-2021. 
Everyone is more than welcome to attend and contribute at the working group call.

Indicio has provided existing code, but we really want to make this into a community effort.

## Project State
### Platform

Aries Bifold currently is built on React Native 0.61.5. Newer versions of React Native experience issues with ZMQ (Fatal Signal 6 (SIGABRT)). We are making efforts to be able to move to React Native 0.63.4.

As of now Aries Bifold targets Android API 29.0.3, with plans to support API 30 soon. 

IOS support is being actively being worked on, with the focus surrounding the indy-sdk consumption from within an iOS context.

### Functionality
Aries Bifold as of now has mocked the UI interactions of the connect and exchange processes, and have developed functionality within the underlying library, however the two pieces have not been integrated with each as of yet. 

### Testing
Aries Bifold's [mobile agent library](https://github.com/Indicio-tech/aries-mobileagent-react-native) currently aims to utilize the [Aries Protocols Test Suite (APTS)](https://github.com/hyperledger/aries-protocol-test-suite) and the [Aries Agent Test Harness (AATH)](https://github.com/hyperledger/aries-agent-test-harness) to test for Aries Agent compatibility and interoperability.

## Running the App
### APKs
Generated APKs can be found in each github release, with further discussion regarding App Stores and the strategy/desires around that.

### App Development Setup
Clone the app:
```
git clone https://github.com/Indicio-tech/aries-bifold
cd aries-bifold
```

Initialize submodules:
```
git submodule update --init
```

Install project dependencies:
```
cd aries-mobileagent-react-native
npm install
cd ..
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

## Troubleshooting

#### Hot Reloading
Hot reloading may not work correctly with instantiated Agent objects. Reloading (`r`) will work. Any changes made to native modules require you to re-run `npm run android`.

#### Mediator ID Issues
There is a known issue that while in development that doesn't open a new wallet, which causes issues with the Mediator IDs. You can work around this issue by closing the app and reopening the app when refreshing changes. Fixes are in progress to address this.

#### Dependency Issues, Native Module Linking Issues, or Usage Issues
If you end up changing dependencies or structures, you may need to perform the following steps:

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