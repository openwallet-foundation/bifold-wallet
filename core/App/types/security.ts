export interface WalletSecret {
  walletId: string
  walletKey: string
}

export enum AuthLevel {
  BiometricsFallbackPin = 'BiometricsFallbackPin',
  BiometricsAndPin = 'BiometricsAndPin',
}
