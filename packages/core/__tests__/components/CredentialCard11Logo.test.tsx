import React from 'react'
import { render } from '@testing-library/react-native'

import CredentialCard11Logo from '../../src/components/misc/CredentialCard11Logo'
import { useTheme } from '../../src/contexts/theme'
import { testIdWithKey } from '../../src/utils/testable'
import { BasicAppContext } from '../helpers/app'

jest.mock('../../src/contexts/theme', () => ({
  useTheme: jest.fn(),
}))

describe('CredentialCard11Logo', () => {
  beforeEach(() => {
    // prettier-ignore
    (useTheme as jest.Mock).mockReturnValue({
      TextTheme: {
        bold: {
          fontWeight: 'bold',
        },
      },
      ListItems: {
        recordAttributeText: {
          fontSize: 18,
          fontWeight: 'normal',
        },
        proofError: {
          color: '#D8292F',
        },
      },
      ColorPallet: {
        grayscale: {
          white: '#fff',
          darkGrey: '#313132',
        },
        semantic: {
          focus: '#3399FF',
        },
        brand: {
          link: '#42803E',
        },
      },
      CredentialCardShadowTheme: {
        shadowColor: '#000',
        shadowOffset: {
          width: 1,
          height: 1,
        },
        shadowOpacity: 0.3,
      },
      maxFontSizeMultiplier: 2,
    })
  })

  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <CredentialCard11Logo noLogoText="Credential" overlay={{} as any} />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })

  test('renders logo image when overlay has logo', () => {
    const overlay = {
      brandingOverlay: {
        logo: 'any_logo_url',
      },
    }

    const tree = render(
      <BasicAppContext>
        <CredentialCard11Logo noLogoText="Credential" overlay={overlay as any} />
      </BasicAppContext>
    )

    const imageLogo = tree.getByTestId(testIdWithKey('Logo'))

    expect(imageLogo).not.toBeNull()
  })

  test('renders noLogoText when overlay has no logo', () => {
    const overlay = {
      brandingOverlay: {},
    }

    const tree = render(
      <BasicAppContext>
        <CredentialCard11Logo noLogoText="Credential" overlay={overlay as any} elevated={true} />
      </BasicAppContext>
    )

    const text = tree.getByTestId(testIdWithKey('NoLogoText'))

    expect(text).not.toBeNull()
    expect(text.props.children).toHaveLength(1)
    expect(text.props.children).toBe('C')
  })
})
