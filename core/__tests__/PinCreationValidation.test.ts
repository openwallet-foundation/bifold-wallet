import { pinCreationValidations } from '../App/utils/pinCreationValidation'

const defaultPinRules = {
  only_numbers: false,
  min_length: 6,
  max_length: 6,
  no_repeated_numbers: false,
  no_series_of_numbers: false,
  no_repetition_of_the_two_same_numbers: false,
  no_even_or_odd_series_of_numbers: false,
  no_cross_pattern: false,
}

const validPin = '132465'

describe('PIN creation validations', () => {
  test('Valid PIN with every validations to false should return everything as valid', async () => {
    const pinValidations = pinCreationValidations(validPin, defaultPinRules)

    for (const pinValidation of pinValidations) {
      expect(pinValidation.isInvalid).toBe(false)
    }
  })
  test('PIN too short with every validations to false should return PinTooShortValidation as invalid', async () => {
    const pinTooShort = '12345'
    const pinValidations = pinCreationValidations(pinTooShort, defaultPinRules)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinTooShortValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('PIN too long with every validations to false should return PinTooLongValidation as invalid', async () => {
    const pinTooLong = '1234567'
    const pinValidations = pinCreationValidations(pinTooLong, defaultPinRules)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinTooLongValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('PIN without only number and only number validation to true should return PinOnlyContainDigitsValidation as invalid', async () => {
    const pinRulesWithOnlyNumbers = {
      ...defaultPinRules,
      only_numbers: true,
    }

    const pinWithoutOnlyNumbers = '123v4a'
    const pinValidations = pinCreationValidations(pinWithoutOnlyNumbers, pinRulesWithOnlyNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'PinOnlyContainDigitsValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('PIN with only number and only number validation to true should return PinOnlyContainDigitsValidation as valid', async () => {
    const pinRulesWithOnlyNumbers = {
      ...defaultPinRules,
      only_numbers: true,
    }

    const pinWithOnlyNumbers = '123456'
    const pinValidations = pinCreationValidations(pinWithOnlyNumbers, pinRulesWithOnlyNumbers)

    for (const pinValidation of pinValidations) {
      expect(pinValidation.isInvalid).toBe(false)
    }
  })
  test('PIN with repeated numbers and repeated numbers validation to true, so the validation use the default of two repeated numbers, should return NoRepetitionOfTheSameNumbersValidation as invalid', async () => {
    const pinRulesWithRepeatedNumbers = {
      ...defaultPinRules,
      no_repeated_numbers: true,
    }

    const pinWithRepeatedNumbers = '113456'
    const pinValidations = pinCreationValidations(pinWithRepeatedNumbers, pinRulesWithRepeatedNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('PIN with repeated numbers and repeated numbers validation to a number, so the validation use that number as validation limit, should return NoRepetitionOfTheSameNumbersValidation as invalid', async () => {
    const pinRulesWithRepeatedNumbers = {
      ...defaultPinRules,
      no_repeated_numbers: 3,
    }

    const pinWithRepeatedNumbers = '111456'
    const pinValidations = pinCreationValidations(pinWithRepeatedNumbers, pinRulesWithRepeatedNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('PIN with a numbers repeated two times and repeated numbers validation set to 3 should return NoRepetitionOfTheSameNumbersValidation as valid', async () => {
    const pinRulesWithRepeatedNumbers = {
      ...defaultPinRules,
      no_repeated_numbers: 3,
    }

    const pinWithRepeatedNumbers = '112456'
    const pinValidations = pinCreationValidations(pinWithRepeatedNumbers, pinRulesWithRepeatedNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('PIN containing a serie of three numbers and no series of numbers validation to true should return NoSeriesOfNumbersValidation as invalid', async () => {
    const pinRulesWithNoSeriesOfNumbers = {
      ...defaultPinRules,
      no_series_of_numbers: true,
    }

    const pinWithSeriesOfNumbers = '123456'
    const pinValidations = pinCreationValidations(pinWithSeriesOfNumbers, pinRulesWithNoSeriesOfNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'SeriesOfThreeNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('PIN without a serie of three numbers and no series of numbers validation to true should return NoSeriesOfNumbersValidation as valid', async () => {
    const pinRulesWithNoSeriesOfNumbers = {
      ...defaultPinRules,
      no_series_of_numbers: true,
    }

    const pinValidations = pinCreationValidations(validPin, pinRulesWithNoSeriesOfNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'SeriesOfThreeNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('Pin containing a repetition of two numbers and no repetition of two same numbers validation to true, so the validation use the default of two repetition of two numbers, should return NoRepetitionOfTheTwoSameNumbersValidation as invalid', async () => {
    const pinRulesWithNoRepetitionOfTwoSameNumbers = {
      ...defaultPinRules,
      no_repetition_of_two_same_numbers: true,
    }

    const pinWithRepetitionOfTwoSameNumbers = '151545'
    const pinValidations = pinCreationValidations(
      pinWithRepetitionOfTwoSameNumbers,
      pinRulesWithNoRepetitionOfTwoSameNumbers
    )

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'NoRepetitionOfTheTwoSameNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('Pin containing a three times repetition of two numbers and no repetition of two same numbers validation set to 3 should return NoRepetitionOfTheTwoSameNumbersValidation as invalid', async () => {
    const pinRulesWithNoRepetitionOfTwoSameNumbers = {
      ...defaultPinRules,
      no_repetition_of_two_same_numbers: true,
    }

    const pinWithRepetitionOfTwoSameNumbers = '151515'
    const pinValidations = pinCreationValidations(
      pinWithRepetitionOfTwoSameNumbers,
      pinRulesWithNoRepetitionOfTwoSameNumbers
    )

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'NoRepetitionOfTheTwoSameNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('Pin containing a repetition of two numbers and no repetition of two same numbers validation set to 3 should return NoRepetitionOfTheTwoSameNumbersValidation as valid', async () => {
    const pinRulesWithNoRepetitionOfTwoSameNumbers = {
      ...defaultPinRules,
      no_repetition_of_two_same_numbers: true,
    }

    const pinWithRepetitionOfTwoSameNumbers = '151545'
    const pinValidations = pinCreationValidations(
      pinWithRepetitionOfTwoSameNumbers,
      pinRulesWithNoRepetitionOfTwoSameNumbers
    )

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'NoRepetitionOfTheTwoSameNumbersValidation') {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('Pin containing a serie of odd numbers and no series of odd numbers validation to true should return NoSeriesOfOddNumbersValidation as invalid', async () => {
    const pinRulesWithNoSeriesOfOddNumbers = {
      ...defaultPinRules,
      no_series_of_odd_numbers: true,
    }

    const pinWithSeriesOfOddNumbers = '135790'
    const pinValidations = pinCreationValidations(pinWithSeriesOfOddNumbers, pinRulesWithNoSeriesOfOddNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('Pin containing a serie of even numbers and no series of even numbers validation to true should return NoSeriesOfEvenNumbersValidation as invalid', async () => {
    const pinRulesWithNoSeriesOfEvenNumbers = {
      ...defaultPinRules,
      no_series_of_even_numbers: true,
    }

    const pinWithSeriesOfEvenNumbers = '024680'
    const pinValidations = pinCreationValidations(pinWithSeriesOfEvenNumbers, pinRulesWithNoSeriesOfEvenNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('Pin without a serie of odd or even numbers and no series of odd numbers validation to true should return NoSeriesOfOddNumbersValidation as valid', async () => {
    const pinRulesWithNoSeriesOfOddNumbers = {
      ...defaultPinRules,
      no_series_of_odd_numbers: true,
    }

    const pinValidations = pinCreationValidations(validPin, pinRulesWithNoSeriesOfOddNumbers)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
  test('Pin containing a cross pattern and no cross pattern validation to true should return NoCrossPatternValidation as invalid', async () => {
    const pinRulesWithNoCrossPattern = {
      ...defaultPinRules,
      no_cross_pattern: true,
    }

    const pinWithCrossPattern = '753951'
    const pinValidations = pinCreationValidations(pinWithCrossPattern, pinRulesWithNoCrossPattern)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'CrossPatternValidation') {
        expect(pinValidation.isInvalid).toBe(true)
      }
    }
  })
  test('Pin without a cross pattern and no cross pattern validation to true should return NoCrossPatternValidation as valid', async () => {
    const pinRulesWithNoCrossPattern = {
      ...defaultPinRules,
      no_cross_pattern: true,
    }

    const pinValidations = pinCreationValidations(validPin, pinRulesWithNoCrossPattern)

    for (const pinValidation of pinValidations) {
      if (pinValidation.errorName === 'CrossPatternValidation') {
        expect(pinValidation.isInvalid).toBe(false)
      }
    }
  })
})
