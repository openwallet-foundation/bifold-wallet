import { render } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'

import Onboarding, { OnboardingStyleSheet } from '../../App/screens/Onboarding'
import { createCarouselStyle } from '../../App/screens/OnboardingPages'
import { theme } from '../../App/theme'
import * as themeContext from '../../App/utils/themeContext' // note we're importing with a * to import all the exports

export const carousel: OnboardingStyleSheet = createCarouselStyle(theme)

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
    jest.spyOn(themeContext, 'useThemeContext').mockImplementation(() => theme)
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
    jest.spyOn(themeContext, 'useThemeContext').mockImplementation(() => theme)
    const { findAllByTestId } = render(
      <Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />
    )
    const foundPages = await findAllByTestId('bodyText')

    expect(foundPages.length).toBe(2)
  })
})
