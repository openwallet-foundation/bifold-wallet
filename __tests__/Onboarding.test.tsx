import React from 'react'
import { Text } from 'react-native'
import { SvgProps } from 'react-native-svg'
import renderer from 'react-test-renderer'

import Onboarding from '../App/screens/Onboarding'

const title = 'My Wallet'
const markTutorialFin = jest.fn()
const pages: { image: React.FC<SvgProps> | null; text: string }[] = [
  {
    image: jest.fn(),
    text: 'Lorem 1 ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    image: jest.fn(),
    text: 'Lorem 2 ipsum dolor sit amet, consectetur adipiscing elit.',
  },
]

jest.mock('@react-navigation/native', () => {
  return {
    useFocusEffect: jest.fn(),
  }
})

describe('Onboarding', () => {
  it('Renders correctly', () => {
    const tree = renderer
      // @ts-ignore
      .create(<Onboarding title={title} pages={pages} onOnboardingDismissed={markTutorialFin} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('Dismisses correctly', () => {
    // @ts-ignore
    const tree = renderer.create(<Onboarding title={title} pages={pages} onOnboardingDismissed={markTutorialFin} />)
    tree.root!.findByProps({ testID: 'dismissButton' }).props.onPress()

    expect(markTutorialFin).toBeCalledTimes(1)
  })

  it('Pages exist', () => {
    // @ts-ignore
    const tree = renderer.create(<Onboarding title={title} pages={pages} onOnboardingDismissed={markTutorialFin} />)
    const foundPages = tree.root!.findAllByType(Text).filter((e: any) => e.props.testID === 'bodyText')

    expect(foundPages.length).toBe(2)
  })
})
