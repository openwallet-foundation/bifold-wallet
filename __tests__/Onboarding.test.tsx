import React from 'react'
import { SvgProps } from 'react-native-svg'
import renderer from 'react-test-renderer'

import Onboarding from '../App/screens/Onboarding'

const title = 'My Wallet'
const pages: { image: React.FC<SvgProps>; text: string }[] = []
const markTutorialFin = async () => {
  return
}

jest.mock('@react-navigation/native', () => {
  return {
    useFocusEffect: jest.fn(),
  }
})

describe('Onboarding', () => {
  // beforeEach(() => {
  //   // Alternatively, set "clearMocks" in your Jest config to "true"
  //   mockedDispatch.mockClear()
  // })

  it('Renders correctly', () => {
    const tree = renderer
      .create(<Onboarding title={title} pages={pages} onOnboardingDismissed={markTutorialFin} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
