import { render } from '@testing-library/react-native'
import React from 'react'
import { StyleSheet, Text } from 'react-native'

import Onboarding, { OnboardingStyleSheet } from '../../App/screens/Onboarding'
import { ColorPallet } from '../../App/theme'

export const carousel: OnboardingStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  carouselContainer: {
    flexDirection: 'column',
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  pagerContainer: {
    flexShrink: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagerDot: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: ColorPallet.brand.primary,
  },
  pagerPosition: {
    position: 'relative',
    top: 0,
  },
  pagerNavigationButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ColorPallet.brand.primary,
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

describe('Onboarding', () => {
  it('Renders correctly', () => {
    const tree = render(<Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />)

    expect(tree).toMatchSnapshot()
  })

  // it('Next works correctly', () => {
  //   // @ts-ignore
  //   const tree = renderer.create(<Onboarding pages={pages} onOnboardingDismissed={markTutorialFin} style={carousel} />)
  //   const b = tree.root!.findByProps({ testID: 'nextButton' })

  //   expect(markTutorialFin).toBeCalledTimes(1)
  // })

  it('Pages exist', async () => {
    const { findAllByTestId } = render(
      <Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />
    )
    const foundPages = await findAllByTestId('bodyText')

    expect(foundPages.length).toBe(2)
  })
})
