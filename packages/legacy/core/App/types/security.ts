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
  Allowed adjacent characters repeatition times
  2 times - 011234 allowed; 011123 is forbidden
  3 times - 011123 allowed; 011112 is forbidden
*/
export enum PINNumberRepeatingTimes {
  TwoTimes = 2,
  ThreeTimes = 3
}

/*
  no_repeated_numbers: false,                   // no repetition check;
  no_repeated_numbers: true,                    // no repetition allowed;
  no_repeated_numbers: PINNumberRepeatingTimes, // check the max repeating times, 1-time equal to 'no repetition allowed';
*/
export interface PINValidationRules {
  only_numbers: boolean
  min_length: number
  max_length: number
  no_repeated_numbers: PINNumberRepeatingTimes | boolean
  no_repetition_of_the_two_same_numbers: boolean | number
  no_series_of_numbers: boolean
  no_even_or_odd_series_of_numbers: boolean
  no_cross_pattern: boolean
}

export interface PINSecurityParams {
  rules: PINValidationRules
  displayHelper: boolean
}
