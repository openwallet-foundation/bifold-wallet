import { act, render } from '@testing-library/react-native'
import React from 'react'
import { View, Text } from 'react-native'

import { credentialOfferTourSteps } from '../../App/components/tour/CredentialOfferTourSteps'
import { credentialsTourSteps } from '../../App/components/tour/CredentialsTourSteps'
import { homeTourSteps } from '../../App/components/tour/HomeTourSteps'
import { proofRequestTourSteps } from '../../App/components/tour/ProofRequestTourSteps'
import { TourOverlay } from '../../App/components/tour/TourOverlay'
import { TourProvider } from '../../App/contexts/tour/tour-provider'
import { TourID } from '../../App/types/tour'

const tourStep = {
  Render: () => {
    return (
      <View>
        <Text>Test</Text>
      </View>
    )
  },
}

describe('TourBox', () => {
  beforeAll(()=>{
    jest.useFakeTimers()
  })
  afterAll(()=>{
    jest.useRealTimers()
  })
  test('Renders properly with defaults', async () => {
    const changeSpot = jest.fn()
    const onBackdropPress = jest.fn()
    const tree = render(
      <TourProvider
        homeTourSteps={homeTourSteps}
        credentialsTourSteps={credentialsTourSteps}
        credentialOfferTourSteps={credentialOfferTourSteps}
        proofRequestTourSteps={proofRequestTourSteps}
        overlayColor={'gray'}
        overlayOpacity={0.7}
      >
        <TourOverlay
          color={'grey'}
          currentStep={0}
          currentTour={TourID.HomeTour}
          changeSpot={changeSpot}
          backdropOpacity={0.7}
          onBackdropPress={onBackdropPress}
          spot={{ x: 0, y: 0, width: 0, height: 0 }}
          tourStep={tourStep}
          nativeDriver={false}
        />
      </TourProvider>
    )
    await act(()=>{ jest.runAllTimers() })
    expect(tree).toMatchSnapshot()
  })
})
