import { act, render } from '@testing-library/react-native'
import React from 'react'

import { credentialOfferTourSteps } from '../../App/components/tour/CredentialOfferTourSteps'
import { credentialsTourSteps } from '../../App/components/tour/CredentialsTourSteps'
import { homeTourSteps } from '../../App/components/tour/HomeTourSteps'
import { proofRequestTourSteps } from '../../App/components/tour/ProofRequestTourSteps'
import { SpotCutout } from '../../App/components/tour/SpotCutout'
import { TourProvider } from '../../App/contexts/tour/tour-provider'

describe('SpotCutout Component', () => {
  beforeAll(()=>{
    jest.useFakeTimers()
  })
  afterAll(()=>{
    jest.useRealTimers()
  })
  test('Renders properly with defaults', async () => {
    const tree = render(
      <TourProvider
        homeTourSteps={homeTourSteps}
        credentialsTourSteps={credentialsTourSteps}
        credentialOfferTourSteps={credentialOfferTourSteps}
        proofRequestTourSteps={proofRequestTourSteps}
        overlayColor={'gray'}
        overlayOpacity={0.7}
      >
        <SpotCutout />
      </TourProvider>
    )
    await act(()=>{ jest.runAllTimers() })
    expect(tree).toMatchSnapshot()
  })
})
