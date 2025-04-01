import React from 'react'
import { render } from '@testing-library/react-native'

import CredentialCard11Logo from '../../src/components/misc/CredentialCard11Logo'
import { BrandingOverlayType } from '@hyperledger/aries-oca/build/legacy'
import { testIdWithKey } from '../../src/utils/testable'

jest.mock('../../src/contexts/theme', () => ({
  useTheme: jest.fn().mockReturnValue({
    TextTheme: {
      bold: {
        fontWeight: 'bold',
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
  }),
}))

describe('CredentialCard11Logo', () => {
  test('Renders correctly', async () => {
    const tree = render(
      <CredentialCard11Logo noLogoText="Credential" overlay={{} as any} overlayType={BrandingOverlayType.Branding10} />
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
      <CredentialCard11Logo
        noLogoText="Credential"
        overlay={overlay as any}
        overlayType={BrandingOverlayType.Branding10}
      />
    )

    const imageLogo = tree.getByTestId(testIdWithKey('Logo'))

    expect(imageLogo).not.toBeNull()
  })

  test('renders noLogoText when overlay has no logo', () => {
    const overlay = {
      brandingOverlay: {},
    }

    const tree = render(
      <CredentialCard11Logo
        noLogoText="Credential"
        overlay={overlay as any}
        overlayType={BrandingOverlayType.Branding10}
        elevated={true}
      />
    )

    const text = tree.getByTestId(testIdWithKey('NoLogoText'))

    expect(text).not.toBeNull()
    expect(text.props.children).toHaveLength(1)
    expect(text.props.children).toBe('C')
  })
})
