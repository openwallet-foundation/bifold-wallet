import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  generateKey(cache: boolean): Promise<string>;
  sha256(stringToHash: string): Promise<Buffer>;
  appleAttestation(keyId: string, challenge: string): Promise<Buffer>;
  appleKeyAttestation(keyId: string, challenge: string): Promise<Buffer>;
  isPlayIntegrityAvailable(): Promise<boolean>;
  googleAttestation(nonce: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Attestation');
