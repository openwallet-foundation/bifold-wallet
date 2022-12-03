import { PINCreationValidations } from '../App/utils/PINCreationValidation'

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
    const PINValidations = PINCreationValidations(validPin, defaultPinRules)

    for (const PINValidation of PINValidations) {
      expect(PINValidation.isInvalid).toBe(false)
    }
  })

  test('PIN too short with every validations to false should return PinTooShortValidation as invalid', async () => {
    const PINTooShort = '12345'
    const PINValidations = PINCreationValidations(PINTooShort, defaultPinRules)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'PINTooShortValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN too long with every validations to false should return PinTooLongValidation as invalid', async () => {
    const PINTooLong = '1234567'
    const PINValidations = PINCreationValidations(PINTooLong, defaultPinRules)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'PINTooLongValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN without only number and only number validation to true should return PinOnlyContainDigitsValidation as invalid', async () => {
    const PINRulesWithOnlyNumbers = {
      ...defaultPinRules,
      only_numbers: true,
    }

    const PINWithoutOnlyNumbers = '123v4a'
    const PINValidations = PINCreationValidations(PINWithoutOnlyNumbers, PINRulesWithOnlyNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'PINOnlyContainDigitsValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN with only number and only number validation to true should return PinOnlyContainDigitsValidation as valid', async () => {
    const PINRulesWithOnlyNumbers = {
      ...defaultPinRules,
      only_numbers: true,
    }

    const PINWithOnlyNumbers = '123456'
    const PINValidations = PINCreationValidations(PINWithOnlyNumbers, PINRulesWithOnlyNumbers)

    for (const PINValidation of PINValidations) {
      expect(PINValidation.isInvalid).toBe(false)
    }
  })

  test('PIN with repeated numbers and repeated numbers validation to true, so the validation use the default of two repeated numbers, should return NoRepetitionOfTheSameNumbersValidation as invalid', async () => {
    const PINRulesWithRepeatedNumbers = {
      ...defaultPinRules,
      no_repeated_numbers: true,
    }

    const PINWithRepeatedNumbers = '113456'
    const PINValidations = PINCreationValidations(PINWithRepeatedNumbers, PINRulesWithRepeatedNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN with repeated numbers and repeated numbers validation to a number, so the validation use that number as validation limit, should return NoRepetitionOfTheSameNumbersValidation as invalid', async () => {
    const PINRulesWithRepeatedNumbers = {
      ...defaultPinRules,
      no_repeated_numbers: 3,
    }

    const PINWithRepeatedNumbers = '111456'
    const PINValidations = PINCreationValidations(PINWithRepeatedNumbers, PINRulesWithRepeatedNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN with a numbers repeated two times and repeated numbers validation set to 3 should return NoRepetitionOfTheSameNumbersValidation as valid', async () => {
    const PINRulesWithRepeatedNumbers = {
      ...defaultPinRules,
      no_repeated_numbers: 3,
    }

    const PINWithRepeatedNumbers = '112456'
    const PINValidations = PINCreationValidations(PINWithRepeatedNumbers, PINRulesWithRepeatedNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })

  test('PIN containing a series of three numbers and no series of numbers validation to true should return NoSeriesOfNumbersValidation as invalid', async () => {
    const PINRulesWithNoSeriesOfNumbers = {
      ...defaultPinRules,
      no_series_of_numbers: true,
    }

    const PINWithSeriesOfNumbers = '123456'
    const PINValidations = PINCreationValidations(PINWithSeriesOfNumbers, PINRulesWithNoSeriesOfNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'SeriesOfThreeNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN without a series of three numbers and no series of numbers validation to true should return NoSeriesOfNumbersValidation as valid', async () => {
    const PINRulesWithNoSeriesOfNumbers = {
      ...defaultPinRules,
      no_series_of_numbers: true,
    }

    const PINValidations = PINCreationValidations(validPin, PINRulesWithNoSeriesOfNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'SeriesOfThreeNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })

  test('PIN containing a repetition of two numbers and no repetition of two same numbers validation to true, so the validation use the default of two repetition of two numbers, should return NoRepetitionOfTheTwoSameNumbersValidation as invalid', async () => {
    const PINRulesWithNoRepetitionOfTwoSameNumbers = {
      ...defaultPinRules,
      no_repetition_of_two_same_numbers: true,
    }

    const PINWithRepetitionOfTwoSameNumbers = '151545'
    const PINValidations = PINCreationValidations(
      PINWithRepetitionOfTwoSameNumbers,
      PINRulesWithNoRepetitionOfTwoSameNumbers
    )

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheTwoSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN containing a three times repetition of two numbers and no repetition of two same numbers validation set to 3 should return NoRepetitionOfTheTwoSameNumbersValidation as invalid', async () => {
    const PINRulesWithNoRepetitionOfTwoSameNumbers = {
      ...defaultPinRules,
      no_repetition_of_two_same_numbers: true,
    }

    const PINWithRepetitionOfTwoSameNumbers = '151515'
    const PINValidations = PINCreationValidations(
      PINWithRepetitionOfTwoSameNumbers,
      PINRulesWithNoRepetitionOfTwoSameNumbers
    )

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheTwoSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN containing a repetition of two numbers and no repetition of two same numbers validation set to 3 should return NoRepetitionOfTheTwoSameNumbersValidation as valid', async () => {
    const PINRulesWithNoRepetitionOfTwoSameNumbers = {
      ...defaultPinRules,
      no_repetition_of_two_same_numbers: true,
    }

    const PINWithRepetitionOfTwoSameNumbers = '151545'
    const PINValidations = PINCreationValidations(
      PINWithRepetitionOfTwoSameNumbers,
      PINRulesWithNoRepetitionOfTwoSameNumbers
    )

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheTwoSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })

  test('PIN containing a series of odd numbers and no series of odd numbers validation to true should return NoSeriesOfOddNumbersValidation as invalid', async () => {
    const PINRulesWithNoSeriesOfOddNumbers = {
      ...defaultPinRules,
      no_series_of_odd_numbers: true,
    }

    const PINWithSeriesOfOddNumbers = '135790'
    const PINValidations = PINCreationValidations(PINWithSeriesOfOddNumbers, PINRulesWithNoSeriesOfOddNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN containing a series of even numbers and no series of even numbers validation to true should return NoSeriesOfEvenNumbersValidation as invalid', async () => {
    const PINRulesWithNoSeriesOfEvenNumbers = {
      ...defaultPinRules,
      no_series_of_even_numbers: true,
    }

    const PINWithSeriesOfEvenNumbers = '024680'
    const PINValidations = PINCreationValidations(PINWithSeriesOfEvenNumbers, PINRulesWithNoSeriesOfEvenNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN without a series of odd or even numbers and no series of odd numbers validation to true should return NoSeriesOfOddNumbersValidation as valid', async () => {
    const PINRulesWithNoSeriesOfOddNumbers = {
      ...defaultPinRules,
      no_series_of_odd_numbers: true,
    }

    const PINValidations = PINCreationValidations(validPin, PINRulesWithNoSeriesOfOddNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })

  test('PIN containing a cross pattern and no cross pattern validation to true should return NoCrossPatternValidation as invalid', async () => {
    const PINRulesWithNoCrossPattern = {
      ...defaultPinRules,
      no_cross_pattern: true,
    }

    const PINWithCrossPattern = '753951'
    const PINValidations = PINCreationValidations(PINWithCrossPattern, PINRulesWithNoCrossPattern)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'CrossPatternValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN without a cross pattern and no cross pattern validation to true should return NoCrossPatternValidation as valid', async () => {
    const PINRulesWithNoCrossPattern = {
      ...defaultPinRules,
      no_cross_pattern: true,
    }

    const PINValidations = PINCreationValidations(validPin, PINRulesWithNoCrossPattern)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'CrossPatternValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })
})
