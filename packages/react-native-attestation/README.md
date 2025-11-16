# react-native-attestation

Mobile app attestation

## Installation

```sh
yarn add @bifold/react-native-attestation
```

## Usage

```ts
import {
  generateKey,
  appleAttestation,
  getAppStoreReceipt,
  isPlayIntegrityAvailable,
  googleAttestation,
} from '@bifold/react-native-attestation';

// ...
if (Platform.OS === 'ios') {
  // Modern DeviceCheck attestation
  const keyId = await generateKey();
  const attestationAsBuffer = await appleAttestation(keyId, nonce);

  // Legacy App Store receipt (for compatibility)
  const appStoreReceipt = await getAppStoreReceipt();
} else if (Platform.OS === 'android') {
  const available = await isPlayIntegrityAvailable();
  if (available) {
    const integrityToken = await googleAttestation(nonce);
  }
}
```

## License

Apache-2.0 License

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
