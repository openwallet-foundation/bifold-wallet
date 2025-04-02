import { testIdWithKey, testIdForAccessabilityLabel } from '../../src/utils/testable'

describe('Testable', () => {
  test('Produces the correct testID', () => {
    const key = 'blarb'
    const result = testIdWithKey(key)

    expect(result).toMatchSnapshot()
  })

  test('Converts a string to testID', () => {
    const label = 'Update your profile'
    const result = testIdForAccessabilityLabel(label)

    expect(result).toMatchSnapshot()
  })
})
