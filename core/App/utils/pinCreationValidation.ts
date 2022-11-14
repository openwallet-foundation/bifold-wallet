import { minPINLength } from '../../lib/module/constants'
import { PinSecurityLevel } from '../types/security'

const sameNumberTwoTimesConsecutive = new RegExp(/(\d)\1{1,}/) // 2 or more consecutive digits ✔️
const sameNumberThreeTimesConsecutive = new RegExp(/(\d)\1{2,}/) // 3 or more consecutive digits ✔️
const consecutiveSeriesOfThree = new RegExp(/012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210/) // 3 or more consecutive digits ✔️
const evenNumberSeries = new RegExp('(13579)') // ✔️
const OddNumberSeries = new RegExp('(02468)') // ✔️
const consecutiveTwoNumberRepetition = new RegExp(/([0-9][0-9])\1{1,}/) // ex: 1515 ✔️
const isNumber = new RegExp('^[0-9]+$') // ✔️
const crossNumberPattern = ['159753', '159357', '951357', '951753', '357159', '357951', '753159', '753951'] // ✔️

export interface PinValidationsType {
  isInvalid: boolean
  errorName:
    | 'CrossPatternValidation'
    | 'OddOrEvenSequenceValidation'
    | 'SameNumberTwoTimesConsecutiveValidation'
    | 'ConsecutiveTwoNumbersRepetitionValidation'
    | 'SameNumberThreeTimesConsecutiveValidation'
    | 'SeriesOfThreeNumbersValidation'
    | 'PinOnlyContain6NumbersValidation'
}

export const pinCreationValidations = (pin: string, pinSecurityLevel: number) => {
  const pinValidations: PinValidationsType[] = []
  if (pinSecurityLevel >= PinSecurityLevel.Level6) {
    pinValidations.push({
      isInvalid: crossNumberPattern.includes(pin),
      errorName: 'CrossPatternValidation',
    } as PinValidationsType)
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level5) {
    pinValidations.push({
      isInvalid: evenNumberSeries.test(pin) || OddNumberSeries.test(pin),
      errorName: 'OddOrEvenSequenceValidation',
    } as PinValidationsType)
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level4) {
    pinValidations.push({
      isInvalid: sameNumberTwoTimesConsecutive.test(pin),
      errorName: 'SameNumberTwoTimesConsecutiveValidation',
    } as PinValidationsType)
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level3) {
    pinValidations.push({
      isInvalid: consecutiveTwoNumberRepetition.test(pin),
      errorName: 'ConsecutiveTwoNumbersRepetitionValidation',
    } as PinValidationsType)
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level2) {
    pinValidations.push(
      {
        isInvalid: sameNumberThreeTimesConsecutive.test(pin),
        errorName: 'SameNumberThreeTimesConsecutiveValidation',
      } as PinValidationsType,
      {
        isInvalid: consecutiveSeriesOfThree.test(pin),
        errorName: 'SeriesOfThreeNumbersValidation',
      } as PinValidationsType
    )
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level1) {
    pinValidations.push({
      isInvalid: !isNumber.test(pin) || pin.length !== minPINLength,
      errorName: 'PinOnlyContain6NumbersValidation',
    } as PinValidationsType)
  }
  return pinValidations
}
