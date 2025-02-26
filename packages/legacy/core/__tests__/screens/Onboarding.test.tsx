import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import * as themeContext from '../../App/contexts/theme' // note we're importing with a * to import all the exports
import Onboarding, { OnboardingStyleSheet } from '../../App/screens/Onboarding'
import { createCarouselStyle, createPageWith } from '../../App/screens/OnboardingPages'
import { OnboardingTheme, theme } from '../../App/theme'
import CredentialList from '../../App/assets/img/credential-list.svg'
import { testIdWithKey } from '../../App/utils/testable'
import { ThemedText } from '../../App/components/texts/ThemedText'
import { BasicAppContext } from '../helpers/app'

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
  test('Renders correctly', () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(
      <BasicAppContext>
        <Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Pages exist', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const { findAllByTestId } = render(
      <BasicAppContext>
        <Onboarding pages={pages} nextButtonText="Next" previousButtonText="Back" style={carousel} />
      </BasicAppContext>
    )
    const foundPages = await findAllByTestId('bodyText')

    expect(foundPages).toHaveLength(2)
  })

  test('Onboarding Developer mode', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const testFunc = jest.fn()
    const tree = render(
      <BasicAppContext>
        <Onboarding
          pages={[createPageWith(CredentialList, 'test', 'body', {}, true, testFunc)]}
          nextButtonText="Next"
          previousButtonText="Back"
          style={carousel}
        />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()

    const devModeButton = await tree.getByTestId(testIdWithKey('DeveloperModeTouch'))
    fireEvent(devModeButton, 'press')
    expect(testFunc).toBeCalledTimes(1)
  })
})
