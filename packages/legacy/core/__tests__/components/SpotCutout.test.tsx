import { act, render } from '@testing-library/react-native'
import React from 'react'

import { SpotCutout } from '../../App/components/tour/SpotCutout'
import { TourProvider } from '../../App/contexts/tour/tour-provider'
import { tours } from '../../App/constants'

describe('SpotCutout Component', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  test('Renders properly with defaults', async () => {
    const tree = render(
      <TourProvider tours={tours} overlayColor={'gray'} overlayOpacity={0.7}>
        <SpotCutout />
      </TourProvider>
    )
    await act(() => {
      jest.runAllTimers()
    })
    expect(tree).toMatchSnapshot()
  })
})
