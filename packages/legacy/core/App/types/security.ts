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
  no_repeated_numbers - forbid adjacent numbers repeating or not, and specify the forbidden repeating times when repeating allowed
  true | 0 | 1 | 2: forbid adjacent numbers repetition
  false: no check for adjacent numbers repeating
  other numbers: the length of adjacent repeating numbers is forbidden, e.g. '3' will forbid 055567, but 055678 is allowed
*/
export interface PINValidationRules {
  only_numbers: boolean
  min_length: number
  max_length: number
  no_repeated_numbers: boolean | number
  no_repetition_of_the_two_same_numbers: boolean | number
  no_series_of_numbers: boolean
  no_even_or_odd_series_of_numbers: boolean
  no_cross_pattern: boolean
}

export interface PINSecurityParams {
  rules: PINValidationRules
  displayHelper: boolean
}
