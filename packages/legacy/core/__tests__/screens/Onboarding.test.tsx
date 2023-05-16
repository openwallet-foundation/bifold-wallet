import { render } from '@testing-library/react-native'
import React from 'react'

import * as themeContext from '../../App/contexts/theme' // note we're importing with a * to import all the exports
import Onboarding from '../../App/screens/Onboarding'
import { createCarouselStyle } from '../../App/screens/OnboardingPages'
import { OnboardingTheme, theme } from '../../App/theme'
import { OnboardingStyleSheet } from '../../App/types/onboarding'

export const carousel: OnboardingStyleSheet = createCarouselStyle(OnboardingTheme)

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('Onboarding', () => {
  test('Renders correctly', () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(
      <Onboarding onTutorialCompleted={() => null} nextButtonText="Next" previousButtonText="Back" style={carousel} />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Pages exist', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const { findAllByTestId } = render(
      <Onboarding onTutorialCompleted={() => null} nextButtonText="Next" previousButtonText="Back" style={carousel} />
    )
    const foundPages = await findAllByTestId('BodyText', { exact: false })

    expect(foundPages.length).toBe(3)
  })
})
