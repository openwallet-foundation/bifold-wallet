# expo-attestation

Expo-backed `AttestationProvider` for `@bifold/core`.

`@bifold/core` does not implement platform attestation itself. It defines an
`AttestationProvider` interface and resolves one from the container, so an app pulls in
only the native dependencies of the implementation it chooses. This package is the
Expo implementation, built on `@expo/app-integrity`.

## Installation

```sh
yarn add @bifold/expo-attestation @expo/app-integrity expo-crypto react-native-uuid
```

The peer dependencies are the native modules this package calls; installing it does not
pull them in on its own.

## Usage

Register the provider on the container. Nothing else changes — the network half of the
flow (`FN_ATTESTATION_GET_CHALLENGE` / `FN_ATTESTATION_GET_JWT`) is registered as before.

```ts
import { TOKENS } from '@bifold/core'
import { expoAttestationProvider } from '@bifold/expo-attestation'

container.registerInstance(TOKENS.ATTESTATION_PROVIDER, expoAttestationProvider)
```

Core registers a stub by default that throws with instructions. It cannot default to a
real provider: doing so would make every consumer depend on this package's native
modules, which is the coupling the interface exists to remove.

Apps that leave `enableAttestation` at its default of `false` never reach the provider.

## What it does

| Platform | Mechanism                | `AttestationResult`                                            |
| -------- | ------------------------ | -------------------------------------------------------------- |
| iOS      | Apple App Attest         | `{ kind: 'apple-app-attest', keyId, attestation }`             |
| Android  | Hardware key attestation | `{ kind: 'android-key-attestation', keyId, certificateChain }` |

The Android path produces an X.509 certificate chain from the Android Keystore, not a
Play Integrity token. `kind` carries that distinction to the verifier, and is also sent
as `attestationKind` on the `GetAttestationJWTPayload`, so a backend does not have to
infer the mechanism from `platform`.

On Android the challenge is SHA-256 hashed before being bound to the key, to stay under
the 128-byte attestation challenge limit. On iOS the OS hashes it, so it is passed
through unmodified.

## License

Apache-2.0 License
