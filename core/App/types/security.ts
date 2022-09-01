export interface WalletSecret {
  id: string
  key?: string
  salt: string
}

export enum AuthLevel {
  BiometricsFallbackPin = 'BiometricsFallbackPin',
  BiometricsAndPin = 'BiometricsAndPin',
  BiometricsOnly = 'BiometricsOnly',
}
