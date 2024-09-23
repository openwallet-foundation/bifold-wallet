import { render } from '@testing-library/react-native'
import React from 'react'
import { View } from 'react-native'

import { AttachTourStep } from '../../App/components/tour/AttachTourStep'
import { credentialOfferTourSteps } from '../../App/components/tour/CredentialOfferTourSteps'
import { credentialsTourSteps } from '../../App/components/tour/CredentialsTourSteps'
import { homeTourSteps } from '../../App/components/tour/HomeTourSteps'
import { proofRequestTourSteps } from '../../App/components/tour/ProofRequestTourSteps'
import { TourProvider } from '../../App/contexts/tour/tour-provider'
import { TourID } from '../../App/types/tour'

describe('AttachTourStep Component', () => {
  test('Renders properly with defaults', () => {
    const tree = render(
      <TourProvider
        homeTourSteps={homeTourSteps}
        credentialsTourSteps={credentialsTourSteps}
        credentialOfferTourSteps={credentialOfferTourSteps}
        proofRequestTourSteps={proofRequestTourSteps}
        overlayColor={'gray'}
        overlayOpacity={0.7}
      >
        <AttachTourStep index={0} tourID={TourID.HomeTour}>
          <View />
        </AttachTourStep>
      </TourProvider>
    )

    expect(tree).toMatchSnapshot()
  })
})
