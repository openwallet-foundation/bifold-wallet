import { render } from '@testing-library/react-native'
import React from 'react'
import { View } from 'react-native'

import { AttachTourStep } from '../../src/components/tour/AttachTourStep'
import { TourProvider } from '../../src/contexts/tour/tour-provider'
import { tours } from '../../src/constants'
import { BaseTourID } from '../../src/types/tour'

describe('AttachTourStep Component', () => {
  test('Renders properly with defaults', () => {
    const tree = render(
      <TourProvider tours={tours} overlayColor={'gray'} overlayOpacity={0.7}>
        <AttachTourStep index={0} tourID={BaseTourID.HomeTour}>
          <View />
        </AttachTourStep>
      </TourProvider>
    )

    expect(tree).toMatchSnapshot()
  })
})
