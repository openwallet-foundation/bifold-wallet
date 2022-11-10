import { minPINLength } from '../../lib/module/constants'
import { PinSecurityLevel } from '../types/security'

const consecutiveSameNumbersTwoTimes = new RegExp(/(\d)\1{1,}/) // 2 or more consecutive digits ✔️
const consecutiveSameNumbersThreeTimes = new RegExp(/(\d)\1{2,}/) // 3 or more consecutive digits ✔️
const consecutiveSeriesOfThree = new RegExp(/012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210/) // 3 or more consecutive digits ✔️
const evenNumberSeries = new RegExp('(13579)') // ✔️
const OddNumberSeries = new RegExp('(02468)') // ✔️
const consecutiveTwoNumberRepetition = new RegExp('([0-9]*[0-9])\\1+') // ex: 1515 ✔️
const isNumber = new RegExp('^[0-9]+$') // ✔️
const crossNumberPattern = ['159753', '159357', '951357', '951753', '357159', '357951', '753159', '753951'] // ✔️

export interface PinOneValidationsType {
  isInvalid: boolean
  errorName:
    | 'CrossPatternValidation'
    | 'OddOrEvenSequenceValidation'
    | 'ConsecutiveSameNumbersTwoTimesValidation'
    | 'ConsecutiveTwoNumberRepetitionValidation'
    | 'ConsecutiveSameNumbersThreeTimesValidation'
    | 'SeriesOfThreeNumbersValidation'
    | 'PinOnlyContain6NumbersValidation'
}

export const pinOneCreationValidations = (pinX: string, pinSecurityLevel: number) => {
  const pinOneValidations: PinOneValidationsType[] = []
  if (pinSecurityLevel >= PinSecurityLevel.Level6) {
    pinOneValidations.push({
      isInvalid: crossNumberPattern.includes(pinX),
      errorName: 'CrossPatternValidation',
    } as PinOneValidationsType)
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level5) {
    pinOneValidations.push({
      isInvalid: evenNumberSeries.test(pinX) || OddNumberSeries.test(pinX),
      errorName: 'OddOrEvenSequenceValidation',
    } as PinOneValidationsType)
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level4) {
    pinOneValidations.push({
      isInvalid: consecutiveSameNumbersTwoTimes.test(pinX),
      errorName: 'ConsecutiveSameNumbersTwoTimesValidation',
    } as PinOneValidationsType)
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level3) {
    pinOneValidations.push({
      isInvalid: consecutiveTwoNumberRepetition.test(pinX),
      errorName: 'ConsecutiveTwoNumberRepetitionValidation',
    } as PinOneValidationsType)
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level2) {
    pinOneValidations.push(
      {
        isInvalid: consecutiveSameNumbersThreeTimes.test(pinX),
        errorName: 'ConsecutiveSameNumbersThreeTimesValidation',
      } as PinOneValidationsType,
      {
        isInvalid: consecutiveSeriesOfThree.test(pinX),
        errorName: 'SeriesOfThreeNumbersValidation',
      } as PinOneValidationsType
    )
  }
  if (pinSecurityLevel >= PinSecurityLevel.Level1) {
    pinOneValidations.push({
      isInvalid: !isNumber.test(pinX) || pinX.length !== minPINLength,
      errorName: 'PinOnlyContain6NumbersValidation',
    } as PinOneValidationsType)
  }
  return pinOneValidations
}
