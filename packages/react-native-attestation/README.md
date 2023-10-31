# react-native-attestation

Mobile app attestation

## Installation

```sh
npm install react-native-attestation
```

## Usage

```ts
import {
  generateKey,
  appleAttestation,
  isPlayIntegrityAvailable,
  googleAttestation,
} from '@hyperledger/aries-react-native-attestation';

// ...
if (Platform.OS === 'ios') {
  const keyId = await generateKey();
  const attestationAsBuffer = await appleAttestation(keyId, nonce);
} else if (Platform.OS === 'android') {
  const available = await isPlayIntegrityAvailable()
  if (available) {
    const integrityToken = await googleAttestation(nonce)
  }
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

Apache-2.0 License

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
