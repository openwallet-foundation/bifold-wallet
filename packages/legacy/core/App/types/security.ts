export interface WalletSecret {
  id: string
  key?: string
  salt: string
}

export enum AuthLevel {
  BiometricsFallbackPIN = 'BiometricsFallbackPIN',
  BiometricsAndPIN = 'BiometricsAndPIN',
  BiometricsOnly = 'BiometricsOnly',
}

/*
  max_repeated_numbers - max repeating times in adjacent PIN numbers
  0 (including undefined or NaN): Repetition is not allowed
  i > 0: adjacent max repeating number times, e.g. '1' repeating 2 times in '011123'
*/
export interface PINValidationRules {
  only_numbers: boolean
  min_length: number
  max_length: number
  max_repeated_numbers: number
  no_repetition_of_the_two_same_numbers: boolean | number
  no_series_of_numbers: boolean
  no_even_or_odd_series_of_numbers: boolean
  no_cross_pattern: boolean
}

export interface PINSecurityParams {
  rules: PINValidationRules
  displayHelper: boolean
}
