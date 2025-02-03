import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { TourBox } from '../../App/components/tour/TourBox'
import { TourProvider } from '../../App/contexts/tour/tour-provider'
import { testIdWithKey } from '../../App/utils/testable'
import { toursMock } from '../fixtures/tours'

describe('TourBox Component', () => {
  test('Renders properly with defaults', () => {
    const previous = jest.fn()
    const next = jest.fn()
    const stop = jest.fn()
    const tree = render(
      <TourProvider tours={toursMock} overlayColor={'gray'} overlayOpacity={0.7}>
        <TourBox
          title={'Title'}
          leftText={'Left'}
          rightText={'Right'}
          onLeft={previous}
          onRight={next}
          currentTour={'homeTourSteps'}
          currentStep={0}
          previous={previous}
          stop={stop}
          next={next}
        />
      </TourProvider>
    )

    const { getByTestId } = tree
    const leftButton = getByTestId(testIdWithKey('Back'))
    const rightButton = getByTestId(testIdWithKey('Next'))
    fireEvent(leftButton, 'press')
    expect(previous).toHaveBeenCalledTimes(1)
    fireEvent(rightButton, 'press')
    expect(next).toHaveBeenCalledTimes(1)

    expect(tree).toMatchSnapshot()
  })
})
