import { render } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'

import * as themeContext from '../../App/contexts/theme' // note we're importing with a * to import all the exports
import Onboarding, { OnboardingStyleSheet } from '../../App/screens/Onboarding'
import { createCarouselStyle } from '../../App/screens/OnboardingPages'
import { OnboardingTheme, theme } from '../../App/theme'

export const carousel: OnboardingStyleSheet = createCarouselStyle(OnboardingTheme)

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
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
  test('Renders correctly', () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(<Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />)

    expect(tree).toMatchSnapshot()
  })

  test('Pages exist', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const { findAllByTestId } = render(
      <Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />
    )
    const foundPages = await findAllByTestId('bodyText')

    expect(foundPages.length).toBe(2)
  })
})
