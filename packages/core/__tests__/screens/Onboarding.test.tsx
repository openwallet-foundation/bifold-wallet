import { render } from '@testing-library/react-native'
import React from 'react'

import { ThemedText } from '../../src/components/texts/ThemedText'
import * as themeContext from '../../src/contexts/theme' // note we're importing with a * to import all the exports
import Onboarding, { OnboardingStyleSheet } from '../../src/screens/Onboarding'
import { createCarouselStyle } from '../../src/screens/OnboardingPages'
import { OnboardingTheme } from '../../src/theme'
import { mockThemeContext } from '../contexts/theme'

export const carousel: OnboardingStyleSheet = createCarouselStyle(OnboardingTheme)

const pages = [
  <>
    <ThemedText testID={'bodyText'}>Hello</ThemedText>
  </>,
  <>
    <ThemedText testID={'bodyText'}>World</ThemedText>
  </>,
]

describe('Onboarding Screen', () => {
  beforeAll(() => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => mockThemeContext)
  })

  test('Renders correctly', () => {
    const tree = render(<Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />)

    expect(tree).toMatchSnapshot()
  })

  test('Pages exist', async () => {
    const { findAllByTestId } = render(
      <Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />
    )
    const foundPages = await findAllByTestId('bodyText')

    expect(foundPages).toHaveLength(2)
  })
})
