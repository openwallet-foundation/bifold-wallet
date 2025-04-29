import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import * as themeContext from '../../src/contexts/theme' // note we're importing with a * to import all the exports
import Onboarding, { OnboardingStyleSheet } from '../../src/screens/Onboarding'
import { createCarouselStyle, createPageWith } from '../../src/screens/OnboardingPages'
import { OnboardingTheme } from '../../src/theme'
import CredentialList from '../../src/assets/img/credential-list.svg'
import { testIdWithKey } from '../../src/utils/testable'
import { ThemedText } from '../../src/components/texts/ThemedText'
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

  test('Onboarding Developer mode', async () => {
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
