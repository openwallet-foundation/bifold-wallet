import { createPINValidations } from '../../src/utils/PINValidation'

const defaultPINRules = {
  only_numbers: false,
  min_length: 6,
  max_length: 6,
  no_repeated_numbers: 0,
  no_series_of_numbers: false,
  no_repetition_of_the_two_same_numbers: false,
  no_even_or_odd_series_of_numbers: false,
  no_cross_pattern: false,
}

const validPIN = '132465'

describe('PIN validations', () => {
  test('Valid PIN with every validations to false should return everything as valid', async () => {
    const PINValidations = createPINValidations(validPIN, defaultPINRules)

    for (const PINValidation of PINValidations) {
      expect(PINValidation.isInvalid).toBe(false)
    }
  })

  test('PIN too short with every validations to false should return PINTooShortValidation as invalid', async () => {
    const PINTooShort = '12345'
    const PINValidations = createPINValidations(PINTooShort, defaultPINRules)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'PINTooShortValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN too long with every validations to false should return PINTooLongValidation as invalid', async () => {
    const PINTooLong = '1234567'
    const PINValidations = createPINValidations(PINTooLong, defaultPINRules)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'PINTooLongValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN adjacent number repetion is allowed when the repeating test is disabled', async () => {
    const PINRepeating = '111111'
    const PINValidations = createPINValidations(PINRepeating, defaultPINRules)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'PINTooLongValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })

  test('PIN without only number and only number validation to true should return PINOnlyContainDigitsValidation as invalid', async () => {
    const PINRulesWithOnlyNumbers = {
      ...defaultPINRules,
      only_numbers: true,
    }

    const PINWithoutOnlyNumbers = '123v4a'
    const PINValidations = createPINValidations(PINWithoutOnlyNumbers, PINRulesWithOnlyNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'PINOnlyContainDigitsValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN with only number and only number validation to true should return PINOnlyContainDigitsValidation as valid', async () => {
    const PINRulesWithOnlyNumbers = {
      ...defaultPINRules,
      only_numbers: true,
    }

    const PINWithOnlyNumbers = '123456'
    const PINValidations = createPINValidations(PINWithOnlyNumbers, PINRulesWithOnlyNumbers)

    for (const PINValidation of PINValidations) {
      expect(PINValidation.isInvalid).toBe(false)
    }
  })

  test('PIN with repeated numbers and no_repeated_numbers is 1, should return NoRepetitionOfTheSameNumbersValidation as invalid', async () => {
    const PINRulesWithRepeatedNumbers = {
      ...defaultPINRules,
      no_repeated_numbers: 1,
    }

    const PINWithRepeatedNumbers = '113456'
    const PINValidations = createPINValidations(PINWithRepeatedNumbers, PINRulesWithRepeatedNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN with 3 repeating adhacent numbers and no_repeated_numbers is 2, so the validation use that number as validation max limit, should return NoRepetitionOfTheSameNumbersValidation as invalid', async () => {
    const PINRulesWithRepeatedNumbers = {
      ...defaultPINRules,
      max_repeated_numbers: 2,
    }

    const PINWithRepeatedNumbers = '111456'
    const PINValidations = createPINValidations(PINWithRepeatedNumbers, PINRulesWithRepeatedNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN with 3 repeating adhacent numbers and no_repeated_numbers is 3, so the validation use that number as validation max limit, should return NoRepetitionOfTheSameNumbersValidation as valid', async () => {
    const PINRulesWithRepeatedNumbers = {
      ...defaultPINRules,
      max_repeated_numbers: 2,
    }

    const PINWithRepeatedNumbers = '111456'
    const PINValidations = createPINValidations(PINWithRepeatedNumbers, PINRulesWithRepeatedNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoRepetitionOfTheSameNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })

  test('PIN containing a series of three numbers and no series of numbers validation to true should return NoSeriesOfNumbersValidation as invalid', async () => {
    const PINRulesWithNoSeriesOfNumbers = {
      ...defaultPINRules,
      no_series_of_numbers: true,
    }

    const PINWithSeriesOfNumbers = '123456'
    const PINValidations = createPINValidations(PINWithSeriesOfNumbers, PINRulesWithNoSeriesOfNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoSeriesOfNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN without a series of three numbers and no series of numbers validation to true should return NoSeriesOfNumbersValidation as valid', async () => {
    const PINRulesWithNoSeriesOfNumbers = {
      ...defaultPINRules,
      no_series_of_numbers: true,
    }

    const PINValidations = createPINValidations(validPIN, PINRulesWithNoSeriesOfNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'NoSeriesOfNumbersValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })

  test('PIN containing a repetition of two numbers and no repetition of two same numbers validation to true, so the validation use the default of two repetition of two numbers, should return NoRepetitionOfTheTwoSameNumbersValidation as invalid', async () => {
    const PINRulesWithNoRepetitionOfTwoSameNumbers = {
      ...defaultPINRules,
      no_repetition_of_two_same_numbers: true,
    }

    const PINWithRepetitionOfTwoSameNumbers = '151545'
    const PINValidations = createPINValidations(
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
      ...defaultPINRules,
      no_repetition_of_two_same_numbers: true,
    }

    const PINWithRepetitionOfTwoSameNumbers = '151515'
    const PINValidations = createPINValidations(
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
      ...defaultPINRules,
      no_repetition_of_two_same_numbers: true,
    }

    const PINWithRepetitionOfTwoSameNumbers = '151545'
    const PINValidations = createPINValidations(
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
      ...defaultPINRules,
      no_series_of_odd_numbers: true,
    }

    const PINWithSeriesOfOddNumbers = '135790'
    const PINValidations = createPINValidations(PINWithSeriesOfOddNumbers, PINRulesWithNoSeriesOfOddNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN containing a series of even numbers and no series of even numbers validation to true should return NoSeriesOfEvenNumbersValidation as invalid', async () => {
    const PINRulesWithNoSeriesOfEvenNumbers = {
      ...defaultPINRules,
      no_series_of_even_numbers: true,
    }

    const PINWithSeriesOfEvenNumbers = '024680'
    const PINValidations = createPINValidations(PINWithSeriesOfEvenNumbers, PINRulesWithNoSeriesOfEvenNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN without a series of odd or even numbers and no series of odd numbers validation to true should return NoSeriesOfOddNumbersValidation as valid', async () => {
    const PINRulesWithNoSeriesOfOddNumbers = {
      ...defaultPINRules,
      no_series_of_odd_numbers: true,
    }

    const PINValidations = createPINValidations(validPIN, PINRulesWithNoSeriesOfOddNumbers)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'OddOrEvenSequenceValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })

  test('PIN containing a cross pattern and no cross pattern validation to true should return NoCrossPatternValidation as invalid', async () => {
    const PINRulesWithNoCrossPattern = {
      ...defaultPINRules,
      no_cross_pattern: true,
    }

    const PINWithCrossPattern = '753951'
    const PINValidations = createPINValidations(PINWithCrossPattern, PINRulesWithNoCrossPattern)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'CrossPatternValidation') {
        expect(PINValidation.isInvalid).toBe(true)
      }
    }
  })

  test('PIN without a cross pattern and no cross pattern validation to true should return NoCrossPatternValidation as valid', async () => {
    const PINRulesWithNoCrossPattern = {
      ...defaultPINRules,
      no_cross_pattern: true,
    }

    const PINValidations = createPINValidations(validPIN, PINRulesWithNoCrossPattern)

    for (const PINValidation of PINValidations) {
      if (PINValidation.errorName === 'CrossPatternValidation') {
        expect(PINValidation.isInvalid).toBe(false)
      }
    }
  })
})
