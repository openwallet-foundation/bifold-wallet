export interface WalletSecret {
  id: string
  key?: string
  salt: string
}

export interface PinChangeReturns {
  walletSecret?: WalletSecret
  pinCorrect: boolean
}

export enum AuthLevel {
  BiometricsFallbackPin = 'BiometricsFallbackPin',
  BiometricsAndPin = 'BiometricsAndPin',
  BiometricsOnly = 'BiometricsOnly',
}
