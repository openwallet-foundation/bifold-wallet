import { act, render } from '@testing-library/react-native'
import React from 'react'
import { View, Text } from 'react-native'

import { TourOverlay } from '../../src/components/tour/TourOverlay'
import { TourProvider } from '../../src/contexts/tour/tour-provider'
import { tours } from '../../src/constants'
import { BaseTourID } from '../../src/types/tour'

const tourStep = {
  Render: () => {
    return (
      <View>
        <Text>Test</Text>
      </View>
    )
  },
}

describe('TourOverlay Component', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  test('Renders properly with defaults', async () => {
    const changeSpot = jest.fn()
    const onBackdropPress = jest.fn()
    const tree = render(
      <TourProvider tours={tours} overlayColor={'gray'} overlayOpacity={0.7}>
        <TourOverlay
          color={'grey'}
          currentStep={0}
          currentTour={BaseTourID.HomeTour}
          changeSpot={changeSpot}
          backdropOpacity={0.7}
          onBackdropPress={onBackdropPress}
          spot={{ x: 0, y: 0, width: 0, height: 0 }}
          tourStep={tourStep}
          nativeDriver={false}
        />
      </TourProvider>
    )
    await act(() => {
      jest.runAllTimers()
    })
    expect(tree).toMatchSnapshot()
  })
})
