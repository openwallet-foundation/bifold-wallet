import React from 'react'
import { StyleSheet, Text } from 'react-native'
import renderer from 'react-test-renderer'

import { Colors } from '../App/Theme'
import Onboarding, { IOnboardingStyleSheet } from '../App/screens/Onboarding'

const markTutorialFin = jest.fn()

export const carousel: IOnboardingStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  carouselContainer: {
    flexDirection: 'column',
    backgroundColor: Colors.background,
  },
  pagerContainer: {
    flexShrink: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagerDot: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.primary,
  },
  pagerPosition: {
    position: 'relative',
    top: 0,
  },
  pagerNavigationButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
})

const pages = [
  <>
    <Text testID={'bodyText'}>Hello</Text>
  </>,
  <>
    <Text testID={'bodyText'}>World</Text>
  </>,
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
      .create(<Onboarding pages={pages} onOnboardingDismissed={markTutorialFin} style={carousel} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  // it('Next works correctly', () => {
  //   // @ts-ignore
  //   const tree = renderer.create(<Onboarding pages={pages} onOnboardingDismissed={markTutorialFin} style={carousel} />)
  //   const b = tree.root!.findByProps({ testID: 'nextButton' })

  //   expect(markTutorialFin).toBeCalledTimes(1)
  // })

  it('Pages exist', () => {
    // @ts-ignore
    const tree = renderer.create(<Onboarding pages={pages} onOnboardingDismissed={markTutorialFin} style={carousel} />)
    const foundPages = tree.root!.findAllByType(Text).filter((e: any) => e.props.testID === 'bodyText')

    expect(foundPages.length).toBe(2)
  })
})
