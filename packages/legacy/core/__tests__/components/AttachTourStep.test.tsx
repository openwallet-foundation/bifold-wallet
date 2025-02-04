import { render } from '@testing-library/react-native'
import React from 'react'
import { View } from 'react-native'

import { AttachTourStep } from '../../App/components/tour/AttachTourStep'
import { TourProvider } from '../../App/contexts/tour/tour-provider'
import { tours } from '../../App/constants'

describe('AttachTourStep Component', () => {
  test('Renders properly with defaults', () => {
    const tree = render(
      <TourProvider tours={tours} overlayColor={'gray'} overlayOpacity={0.7}>
        <AttachTourStep index={0} tourID={'homeTourSteps'}>
          <View />
        </AttachTourStep>
      </TourProvider>
    )

    expect(tree).toMatchSnapshot()
  })
})
