import { act, render } from '@testing-library/react-native'
import React from 'react'

import LoadingView from '../../src/components/views/LoadingView'
import { testIdWithKey } from '../../src/utils/testable'

describe('LoadingView Component', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  test('renders correctly', () => {
    const tree = render(<LoadingView />)

    expect(tree).toMatchSnapshot()
  })

  test('contains testIDs', async () => {
    const tree = render(<LoadingView />)
    await act(() => {
      jest.runAllTimers()
    })
    await act(async () => {
      const loadingActivityIndicatorID = await tree.findByTestId(testIdWithKey('LoadingActivityIndicator'))
      expect(loadingActivityIndicatorID).not.toBeNull()
    })
  })
})
