import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'

import * as themeContext from '../../App/contexts/theme' // note we're importing with a * to import all the exports
import Onboarding, { OnboardingStyleSheet } from '../../App/screens/Onboarding'
import { createCarouselStyle, createPageWith } from '../../App/screens/OnboardingPages'
import { OnboardingTheme, theme } from '../../App/theme'
import CredentialList from '../../App/assets/img/credential-list.svg'
import { testIdWithKey } from '../../App/utils/testable'

export const carousel: OnboardingStyleSheet = createCarouselStyle(OnboardingTheme)

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

  test('Onboarding Developer mode', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const testFunc = jest.fn()
    const tree = render(
      <Onboarding
        pages={[createPageWith(CredentialList, 'test', 'body', {}, true, testFunc)]}
        nextButtonText="Next"
        previousButtonText="Back"
        style={carousel}
      />
    )
    expect(tree).toMatchSnapshot()

    const devModeButton = await tree.getByTestId(testIdWithKey('DeveloperModeTouch'))
    fireEvent(devModeButton, 'press')
    expect(testFunc).toBeCalledTimes(1)
  })
})
