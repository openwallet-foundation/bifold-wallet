import { PINRules } from '../types/security'

const consecutiveSeriesOfThree = new RegExp(/012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210/)
const evenNumberSeries = new RegExp('(13579)')
const oddNumberSeries = new RegExp('(02468)')
const isNumber = new RegExp('^[0-9]+$')
const crossNumberPattern = ['159753', '159357', '951357', '951753', '357159', '357951', '753159', '753951']

export interface PinValidationsType {
  isInvalid: boolean
  errorName:
    | 'CrossPatternValidation'
    | 'OddOrEvenSequenceValidation'
    | 'NoRepetitionOfTheSameNumbersValidation'
    | 'NoRepetitionOfTheTwoSameNumbersValidation'
    | 'NoSeriesOfNumbersValidation'
    | 'PinOnlyContainDigitsValidation'
    | 'PinTooShortValidation'
    | 'PinTooLongValidation'
}

export const pinCreationValidations = (pin: string, pinRules: PINRules) => {
  const pinValidations: PinValidationsType[] = []
  if (pinRules.no_cross_pattern) {
    pinValidations.push({
      isInvalid: crossNumberPattern.includes(pin),
      errorName: 'CrossPatternValidation',
    } as PinValidationsType)
  }
  if (pinRules.no_even_or_odd_series_of_numbers) {
    pinValidations.push({
      isInvalid: evenNumberSeries.test(pin) || oddNumberSeries.test(pin),
      errorName: 'OddOrEvenSequenceValidation',
    } as PinValidationsType)
  }
  if (pinRules.no_repeated_numbers) {
    let noRepeatedNumbers = new RegExp(/(\d)\1{1,}/)
    if (typeof pinRules.no_repeated_numbers === 'number') {
      noRepeatedNumbers = new RegExp(`(\\d)\\1{${pinRules.no_repeated_numbers - 1},}`)
    }
    pinValidations.push({
      isInvalid: noRepeatedNumbers.test(pin),
      errorName: 'NoRepetitionOfTheSameNumbersValidation',
    } as PinValidationsType)
  }
  if (pinRules.no_repetition_of_the_two_same_numbers) {
    let noRepetitionOfTheTwoSameNumbers = new RegExp(/([0-9][0-9])\1{1,}/)
    if (typeof pinRules.no_repetition_of_the_two_same_numbers === 'number') {
      noRepetitionOfTheTwoSameNumbers = new RegExp(
        `([0-9][0-9])\\1{${pinRules.no_repetition_of_the_two_same_numbers - 1},}`
      )
    }
    pinValidations.push({
      isInvalid: noRepetitionOfTheTwoSameNumbers.test(pin),
      errorName: 'NoRepetitionOfTheTwoSameNumbersValidation',
    } as PinValidationsType)
  }
  if (pinRules.no_series_of_numbers) {
    pinValidations.push({
      isInvalid: consecutiveSeriesOfThree.test(pin),
      errorName: 'NoSeriesOfNumbersValidation',
    } as PinValidationsType)
  }
  if (pinRules.only_numbers) {
    pinValidations.push({
      isInvalid: !isNumber.test(pin),
      errorName: 'PinOnlyContainDigitsValidation',
    } as PinValidationsType)
  }

  pinValidations.push({
    isInvalid: pin.length < pinRules.min_length || pin.length > pinRules.max_length,
    errorName: pin.length < pinRules.max_length ? 'PinTooShortValidation' : 'PinTooLongValidation',
  } as PinValidationsType)

  return pinValidations
}
