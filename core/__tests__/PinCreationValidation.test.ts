import { PinSecurityLevel } from '../App/types/security'
import { pinCreationValidations } from '../App/utils/pinCreationValidation'

const validePin = '132435'

describe('PIN creation validations', () => {
  test('PIN security level 1 with a valid pin should return every validation with invalid to false', async () => {
    const pinValidations = pinCreationValidations(validePin, PinSecurityLevel.Level1)

    for (const pinValidation of pinValidations) {
      expect(pinValidation.isInvalid).toBe(false)
    }
  })
  test('PIN security level 1 with a pin containing invalid char should return PinOnlyContain6NumbersValidation to invalid', async () => {
    const pinContainingInvalidChar = '1324a5'
    const pinValidations = pinCreationValidations(pinContainingInvalidChar, PinSecurityLevel.Level1)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinOnlyContain6NumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 1 with a pin of lenght 5 should return PinOnlyContain6NumbersValidation to invalid', async () => {
    const pinContainingInvalidChar = '1324a5'
    const pinValidations = pinCreationValidations(pinContainingInvalidChar, PinSecurityLevel.Level1)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinOnlyContain6NumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 2 with a valid pin should return every validation as valid', async () => {
    const pinValidations = pinCreationValidations(validePin, PinSecurityLevel.Level2)

    for (const pinValidation of pinValidations) {
      expect(pinValidation.isInvalid).toBe(false)
    }
  })
  test('PIN security level 2 with invalid verification of level 1 should return an invalid check', async () => {
    const pinContainingInvalidChar = '1324a5'
    const pinValidations = pinCreationValidations(pinContainingInvalidChar, PinSecurityLevel.Level2)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinOnlyContain6NumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 2 with same number three times consecutive should return ConsecutiveSameNumbersThreeTimesValidation to invalid', async () => {
    const pinContainingSameNumberThreeTimes = '111738'
    const pinValidations = pinCreationValidations(pinContainingSameNumberThreeTimes, PinSecurityLevel.Level2)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'SameNumberThreeTimesConsecutiveValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 2 with a series of three numbers should return SeriesOfThreeNumbersValidation to invalid', async () => {
    const pinContainingSeriesOfThreeNumbers = '123738'
    const pinValidations = pinCreationValidations(pinContainingSeriesOfThreeNumbers, PinSecurityLevel.Level2)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'SeriesOfThreeNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 3 with a valid pin should return every validation as valid', async () => {
    const pinValidations = pinCreationValidations(validePin, PinSecurityLevel.Level3)

    for (const pinValidation of pinValidations) {
      expect(pinValidation.isInvalid).toBe(false)
    }
  })
  test('PIN security level 3 with invalid verification of level 1 should return an invalid check', async () => {
    const pinContainingInvalidChar = '1324a5'
    const pinValidations = pinCreationValidations(pinContainingInvalidChar, PinSecurityLevel.Level3)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinOnlyContain6NumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 3 with consecutive two numbers repetition should return ConsecutiveTwoNumbersRepetitionValidation to invalid', async () => {
    const pinContainingConsecutiveTwoNumbersRepetition = '191937'
    const pinValidations = pinCreationValidations(pinContainingConsecutiveTwoNumbersRepetition, PinSecurityLevel.Level3)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'ConsecutiveTwoNumbersRepetitionValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 4 with a valid pin should return every validation as valid', async () => {
    const pinValidations = pinCreationValidations(validePin, PinSecurityLevel.Level4)

    for (const pinValidation of pinValidations) {
      expect(pinValidation.isInvalid).toBe(false)
    }
  })
  test('PIN security level 4 with invalid verification of level 1 should return an invalid check', async () => {
    const pinContainingInvalidChar = '1324a5'
    const pinValidations = pinCreationValidations(pinContainingInvalidChar, PinSecurityLevel.Level4)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinOnlyContain6NumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 4 with same number two times consecutive should return SameNumberTwoTimesConsecutiveValidation to invalid', async () => {
    const pinContainingSameNumbersTwoTimesConsecutive = '118305'
    const pinValidations = pinCreationValidations(pinContainingSameNumbersTwoTimesConsecutive, PinSecurityLevel.Level4)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'SameNumberTwoTimesConsecutiveValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 5 with a valid pin should return every validation as valid', async () => {
    const pinValidations = pinCreationValidations(validePin, PinSecurityLevel.Level5)

    for (const pinValidation of pinValidations) {
      expect(pinValidation.isInvalid).toBe(false)
    }
  })
  test('PIN security level 5 with invalid verification of level 1 should return an invalid check', async () => {
    const pinContainingInvalidChar = '1324a5'
    const pinValidations = pinCreationValidations(pinContainingInvalidChar, PinSecurityLevel.Level5)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinOnlyContain6NumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 5 with an even series should return OddOrEvenSequenceValidation to invalid', async () => {
    const pinContainingEvenSequenceValidation = '902468'
    const pinValidations = pinCreationValidations(pinContainingEvenSequenceValidation, PinSecurityLevel.Level5)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 5 with an odd series should return OddOrEvenSequenceValidation to invalid', async () => {
    const pinContainingOddSequenceValidation = '135794'
    const pinValidations = pinCreationValidations(pinContainingOddSequenceValidation, PinSecurityLevel.Level5)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 6 with a valid pin should return every validation as valid', async () => {
    const pinValidations = pinCreationValidations(validePin, PinSecurityLevel.Level6)

    for (const pinValidation of pinValidations) {
      expect(pinValidation.isInvalid).toBe(false)
    }
  })
  test('PIN security level 6 with invalid verification of level 1 should return an invalid check', async () => {
    const pinContainingInvalidChar = '1324a5'
    const pinValidations = pinCreationValidations(pinContainingInvalidChar, PinSecurityLevel.Level6)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinOnlyContain6NumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN security level 6 with an cross pattern should return CrossPatternValidation to invalid', async () => {
    const pinContainingCrossPattern = '753951'
    const pinValidations = pinCreationValidations(pinContainingCrossPattern, PinSecurityLevel.Level6)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'CrossPatternValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      } else {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
})
