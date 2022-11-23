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

export interface PINRules {
  only_numbers: boolean
  min_length: number
  max_length: number
  no_repeated_numbers: boolean | number
  no_repetition_of_the_two_same_numbers: boolean | number
  no_series_of_numbers: boolean
  no_even_or_odd_series_of_numbers: boolean
  no_cross_pattern: boolean
}

export interface PinSecurityParams {
  rules: PINRules
  displayHelper: boolean
}
