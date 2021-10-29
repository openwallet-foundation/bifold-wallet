# Aries Mobile Agent React Native

Aries Mobile Agent React Native is an open source Aries mobile agent app. This is a project that has been created to focus the community's efforts towards a central open source project. Various different organizations and people have expressed interest in a open source community project to help focus efforts to help prevent duplication of work between projects. Aries Bifold is also intended to help get complex or specific use-case projects started faster by cloning and having a basis of an Aries agent.

## Code

This project utilizes [Aries Framework Javascript (AFJ)](https://github.com/hyperledger/aries-framework-javascript) and [indy-sdk-react-native](https://github.com/hyperledger/indy-sdk-react-native).

## Community

The Bifold User Group call takes place every other week on Tuesdays, 16:00 UTC via [Zoom](https://zoom.us/j/92215586249?pwd=Vm5ZTGV4T0cwVEl4blh3MjBzYjVYZz09).
This meeting is for contributors to discuss issues and plan work items.
Meeting agendas and recordings can be found [here](https://wiki.hyperledger.org/display/ARIES/Framework+JS+Meetings).
Everybody is welcome to attend and contribute!

## Project State

### Platform

Aries Bifold currently is built on React Native 0.64.1

As of now Aries Bifold targets Android API 29.0.3, with plans to support API 30 soon.

iOS targets iOS 10.0+. Aries Bifold can only be run on physical devices as of right now.

### Testing

Aries Bifold utilizes the [Aries Agent Test Harness (AATH)](https://github.com/hyperledger/aries-agent-test-harness) to test for Aries Agent compatibility and interoperability.

Aries Bifold also utilizes the [Aries Toolbox](https://github.com/hyperledger/aries-toolbox) & [aries-acapy-plugin-toolbox](https://github.com/hyperledger/aries-acapy-plugin-toolbox) for issuer and verifier roles.

## Install

You can watch a recording of setting up and running the mobile wallet and receiving a credential using the ACA-Py demo. Watch the video [here](https://youtu.be/AomoHvw4lgc) (thanks [@xtrycatchx](https://github.com/xtrycatchx)).

1. React Native Setup:
   - React Native installation instructions are documented [here](https://reactnative.dev/docs/environment-setup).
   - (iOS) Install [Cocoa Pods](https://cocoapods.org/)
2. Clone the Bifold repo and install its dependencies:
   ```sh
   git clone https://github.com/hyperledger/aries-mobile-agent-react-native
   cd aries-mobile-agent-react-native
   npm install
   ```
3. (iOS) iOS specific install:
   - Install iOS Pods:
     ```sh
     cd ios
     pod install
     ```
   - In the /ios directory, open the project workspace file in Xcode.
     Once the project is open, navigate to the project's Signing & Capabilities tab and apply your personal Apple Developer Account or your organization's team to target AriesBifold and target AriesBifoldTests.
   - Adjust the bundle identifier if needed.

## Configure

In the root directory add an `.env` file containing:

```
MEDIATOR_URL=http://mediator3.test.indiciotech.io:3000?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiYjE5YTM2ZjctZjhiZi00Mjg2LTg4ZjktODM4ZTIyZDI0ZjQxIiwgInJlY2lwaWVudEtleXMiOiBbIkU5VlhKY1pzaGlYcXFMRXd6R3RtUEpCUnBtMjl4dmJMYVpuWktTU0ZOdkE2Il0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL21lZGlhdG9yMy50ZXN0LmluZGljaW90ZWNoLmlvOjMwMDAiLCAibGFiZWwiOiAiSW5kaWNpbyBQdWJsaWMgTWVkaWF0b3IifQ==
GENESIS_URL=https://raw.githubusercontent.com/Indicio-tech/indicio-network/main/genesis_files/pool_transactions_testnet_genesis
```

Note - To run your own mediator or use a different network, go [here for advanced configuration](#advanced-configuration).

## Run

- Launch the metro bundler:
  ```sh
  npm run start
  ```
- Open a second terminal and run:
  - (Android)
    ```sh
    npm run android
    ```
  - (iOS)
    ```sh
    npm run ios
    ```
  - (iOS) Via Xcode:
    Choose your physical iOS device as the destination. Click the "Play" button to Build and Run.

**NOTE: Bifold does not work on iOS simulators** -- use a physical device instead.

### Advanced Configuration

#### Mediator

In order to use Aries Bifold, you must have a mediator to use with the app. Bifold is configured to use 'Implicit' mediation and requires a mediator that supports the [coordinate-mediation protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0211-route-coordination).
Bifold by default utilizes the [Indicio Public Mediator](https://indicio-tech.github.io/mediator/), which utilizes ACA-Py. For running your own ACA-Py mediator more details can be found [here](https://github.com/hyperledger/aries-cloudagent-python/blob/main/Mediation.md).

#### Network

Aries Bifold as of right now is tied to one ledger with the intention of adding multi-ledger support in the future. You must provide a genesis url for your chosen network, such as:

- Indicio TestNet: https://raw.githubusercontent.com/Indicio-tech/indicio-network/main/genesis_files/pool_transactions_testnet_genesis
- Sovrin StagingNet: https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_sandbox_genesis

## Troubleshooting

#### Hot Reloading

Hot reloading may not work correctly with instantiated Agent objects. Reloading (`r`) or reopening the app may work. Any changes made to native modules require you to re-run the compile step.

### Dependency Issues, Native Module Linking Issues, or Usage Issues

If you end up changing dependencies or structures, you may need to perform the following steps:

#### Android

```sh
rm -rf node_modules
npm install
```

Clean the Android build:

```sh
cd android
./gradlew clean
cd ..
```

Start and clean the Metro cache:

```sh
npm run start
```

In your second terminal, you can now run:

```sh
npm run android
```

## License

[Apache License Version 2.0](./LICENSE)
