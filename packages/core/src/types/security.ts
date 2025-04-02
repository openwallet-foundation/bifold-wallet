export interface WalletSecret {
  id: string
  key: string
  salt: string
}

export enum AuthLevel {
  BiometricsFallbackPIN = 'BiometricsFallbackPIN',
  BiometricsAndPIN = 'BiometricsAndPIN',
  BiometricsOnly = 'BiometricsOnly',
}

/*
  no_repeated_numbers - adjacent characters allowed repeating times
  0 - Disable adjacent number repeating validation, any times repeating are allowed
  n > 0 - Enable the repeating validation, n repeating times are forbidden, e.g. n = 2 forbid repeating 2 times, '11' is allowed but '111' forbidden
*/
export interface PINValidationRules {
  only_numbers: boolean
  min_length: number
  max_length: number
  no_repeated_numbers: number
  no_repetition_of_the_two_same_numbers: boolean | number
  no_series_of_numbers: boolean
  no_even_or_odd_series_of_numbers: boolean
  no_cross_pattern: boolean
}

export interface PINSecurityParams {
  rules: PINValidationRules
  displayHelper: boolean
}
