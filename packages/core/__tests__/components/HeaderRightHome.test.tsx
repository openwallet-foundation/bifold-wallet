import { render } from '@testing-library/react-native'
import React from 'react'
import HeaderRightHome from '../../src/components/buttons/HeaderHome'
import * as container from '../../src/container-api'

jest.mock('../../src/container-api', () => ({
  useServices: jest.fn(),
  TOKENS: {
    UTIL_LOGGER: 'UTIL_LOGGER',
  },
}))

describe('HeaderRightHome Component', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Renders correctly', () => {
    const containerMock = jest.mocked(container)
    containerMock.useServices.mockReturnValue([{ warn: jest.fn() }] as any)

    const tree = render(<HeaderRightHome />)

    expect(tree).toMatchSnapshot()
  })
})
