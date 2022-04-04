import { testIdWithKey } from '../App/utils/testable'

describe('Testable', () => {
  it('Produces the correct testID', () => {
    const key = 'blarb'
    const result = testIdWithKey(key)

    expect(result).toMatchSnapshot()
  })
})
