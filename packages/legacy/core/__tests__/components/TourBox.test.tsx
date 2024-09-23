import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { credentialOfferTourSteps } from '../../App/components/tour/CredentialOfferTourSteps'
import { credentialsTourSteps } from '../../App/components/tour/CredentialsTourSteps'
import { homeTourSteps } from '../../App/components/tour/HomeTourSteps'
import { proofRequestTourSteps } from '../../App/components/tour/ProofRequestTourSteps'
import { TourBox } from '../../App/components/tour/TourBox'
import { TourProvider } from '../../App/contexts/tour/tour-provider'
import { TourID } from '../../App/types/tour'
import { testIdWithKey } from '../../App/utils/testable'

describe('TourBox Component', () => {
  test('Renders properly with defaults', () => {
    const previous = jest.fn()
    const next = jest.fn()
    const stop = jest.fn()
    const tree = render(
      <TourProvider
        homeTourSteps={homeTourSteps}
        credentialsTourSteps={credentialsTourSteps}
        credentialOfferTourSteps={credentialOfferTourSteps}
        proofRequestTourSteps={proofRequestTourSteps}
        overlayColor={'gray'}
        overlayOpacity={0.7}
      >
        <TourBox
          title={'Title'}
          leftText={'Left'}
          rightText={'Right'}
          onLeft={previous}
          onRight={next}
          currentTour={TourID.HomeTour}
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
