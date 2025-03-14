import { PINValidationRules } from '../types/security'

const consecutiveSeriesOfThree = new RegExp(/012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210/)
const evenNumberSeries = new RegExp('(13579)')
const oddNumberSeries = new RegExp('(02468)')
const isNumber = new RegExp('^[0-9]+$')
const crossNumberPattern = ['159753', '159357', '951357', '951753', '357159', '357951', '753159', '753951']

export enum PINError {
  CrossPatternValidation = 'CrossPatternValidation',
  OddOrEvenSequenceValidation = 'OddOrEvenSequenceValidation',
  NoRepetitionOfTheSameNumbersValidation = 'NoRepetitionOfTheSameNumbersValidation',
  MaxAdjacentNumberRepetitionValidation = 'MaxAdjacentNumberRepetitionValidation',
  NoRepetitionOfTheTwoSameNumbersValidation = 'NoRepetitionOfTheTwoSameNumbersValidation',
  NoSeriesOfNumbersValidation = 'NoSeriesOfNumbersValidation',
  PINOnlyContainDigitsValidation = 'PINOnlyContainDigitsValidation',
  PINTooShortValidation = 'PINTooShortValidation',
  PINTooLongValidation = 'PINTooLongValidation',
}

export interface PINValidationsType {
  isInvalid: boolean
  errorName: PINError
}

export const PINCreationValidations = (PIN: string, PINRules: PINValidationRules) => {
  const PINValidations: PINValidationsType[] = []
  
  if (PINRules.no_cross_pattern) {
    PINValidations.push({
      isInvalid: crossNumberPattern.includes(PIN),
      errorName: PINError.CrossPatternValidation,
    } as PINValidationsType)
  }
  if (PINRules.no_even_or_odd_series_of_numbers) {
    PINValidations.push({
      isInvalid: evenNumberSeries.test(PIN) || oddNumberSeries.test(PIN),
      errorName: PINError.OddOrEvenSequenceValidation,
    } as PINValidationsType)
  }

  if (1 == PINRules.no_repeated_numbers) {
    const repetitionPattern = new RegExp(/(\d)\1{1,}/)
    PINValidations.push({
      isInvalid: repetitionPattern.test(PIN),
      errorName: PINError.NoRepetitionOfTheSameNumbersValidation
    } as PINValidationsType)
  } else if (1 < PINRules.no_repeated_numbers){
    const repetitionPattern = new RegExp(String.raw`(\d)\1{${PINRules.no_repeated_numbers},}`, "g")
    PINValidations.push({
      isInvalid: repetitionPattern.test(PIN),
      errorName: PINError.MaxAdjacentNumberRepetitionValidation
    } as PINValidationsType)
  }

  if (PINRules.no_repetition_of_the_two_same_numbers) {
    let noRepetitionOfTheTwoSameNumbers = new RegExp(/([0-9][0-9])\1{1,}/)
    if (typeof PINRules.no_repetition_of_the_two_same_numbers === 'number') {
      noRepetitionOfTheTwoSameNumbers = new RegExp(
        `([0-9][0-9])\\1{${PINRules.no_repetition_of_the_two_same_numbers - 1},}`
      )
    }
    PINValidations.push({
      isInvalid: noRepetitionOfTheTwoSameNumbers.test(PIN),
      errorName: PINError.NoRepetitionOfTheTwoSameNumbersValidation,
    } as PINValidationsType)
  }
 
  if (PINRules.no_series_of_numbers) {
    PINValidations.push({
      isInvalid: consecutiveSeriesOfThree.test(PIN),
      errorName: PINError.NoSeriesOfNumbersValidation,
    } as PINValidationsType)
  }
  if (PINRules.only_numbers) {
    PINValidations.push({
      isInvalid: !isNumber.test(PIN),
      errorName: PINError.PINOnlyContainDigitsValidation,
    } as PINValidationsType)
  }

  PINValidations.push({
    isInvalid: PIN.length < PINRules.min_length || PIN.length > PINRules.max_length,
    errorName: PIN.length <= PINRules.max_length ? PINError.PINTooShortValidation : PINError.PINTooLongValidation,
  } as PINValidationsType)

  return PINValidations
}
