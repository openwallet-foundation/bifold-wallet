import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  generateKey(): Promise<string>;
  sha256(stringToHash: string): Promise<Buffer>;
  appleAttestation(keyId: string, challenge: string): Promise<Buffer>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Attestation');
