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
  Level4 = 4,
  Level5 = 5,
  Level6 = 6,
  Level7 = 7,
}

export interface PinSecurityParams {
  level: PinSecurityLevel
  minLength: number
  maxLength: number
}
