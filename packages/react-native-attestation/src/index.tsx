import { NativeModules, Platform } from 'react-native';
import { Buffer } from 'buffer';

const LINKING_ERROR =
  `The package 'react-native-attestation' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const AttestationModule = isTurboModuleEnabled
  ? require('./NativeAttestation').default
  : NativeModules.Attestation;

const Attestation = AttestationModule
  ? AttestationModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const generateKey = async (): Promise<string> => {
  return Attestation.generateKey();
};

export const sha256 = async (stringToHash: string): Promise<Buffer> => {
  const bytes: Uint8Array = await Attestation.sha256(stringToHash);
  return Buffer.from(bytes);
};

export const appleAttestation = async (
  keyId: string,
  challenge: string
): Promise<Buffer> => {
  const bytes: Uint8Array = await Attestation.appleAttestation(
    keyId,
    challenge
  );

  return Buffer.from(bytes);
};
