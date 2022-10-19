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

export enum PinSecurityLevel {
  Level1 = 1,
  Level2 = 2,
  Level3 = 3,
}

export interface PinSecurityParams {
  level: PinSecurityLevel
  minLength: number
  maxLength: number
}
