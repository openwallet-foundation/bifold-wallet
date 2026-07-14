import type { WalletCredentialCardData } from '../../src/wallet/ui-types'
import { toWalletCredentialCardViewModel } from '../../src/wallet/to-card-view-model'

const cardData = (brandingType: WalletCredentialCardData['brandingType']): WalletCredentialCardData => ({
  id: 'credential-id',
  issuerName: 'Issuer',
  credentialName: 'Credential',
  brandingType,
  branding: {
    type: brandingType,
    primaryBg: '#ffffff',
    secondaryBg: '#eeeeee',
    logo1x1Uri: 'https://example.com/logo.png',
    backgroundFullUri: 'https://example.com/background.png',
  },
  items: [{ key: 'name', label: 'Name', value: 'Alice' }],
  hideSlice: true,
})

describe('toWalletCredentialCardViewModel', () => {
  it.each([
    ['Branding01', 'card10'],
    ['Branding10', 'card11'],
    ['Branding11', 'card11'],
  ] as const)('maps %s to the local %s layout', (brandingType, layout) => {
    expect(toWalletCredentialCardViewModel(cardData(brandingType)).layout).toBe(layout)
  })

  it('maps legacy mapper fields into OCA-free view fields', () => {
    const viewModel = toWalletCredentialCardViewModel(cardData('Branding10'))

    expect(viewModel).toMatchObject({
      layout: 'card11',
      attributes: [{ key: 'name', label: 'Name', value: 'Alice' }],
      hideBrandingSlice: true,
      branding: {
        primaryBackgroundColor: '#ffffff',
        secondaryBackgroundColor: '#eeeeee',
        logoUri: 'https://example.com/logo.png',
        backgroundImageUri: 'https://example.com/background.png',
      },
    })
  })
})
