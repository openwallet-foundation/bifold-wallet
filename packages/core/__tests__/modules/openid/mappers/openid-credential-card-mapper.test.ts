import { ClaimFormat } from '@credo-ts/core'
import { mapOpenIdCredentialToCardViewModel } from '../../../../src/modules/openid/mappers/openid-credential-card-mapper'
import type { W3cCredentialDisplay } from '../../../../src/modules/openid/types'

const display: W3cCredentialDisplay = {
  id: 'w3c-credential-id',
  createdAt: new Date('2024-01-01'),
  display: {
    name: 'Health Card',
    issuer: { name: 'Example Issuer', logo: { uri: 'https://example.com/issuer-logo.png' } },
    backgroundColor: '#123456',
    textColor: '#ffffff',
    backgroundImage: { uri: 'https://example.com/background.png' },
    primary_overlay_attribute: 'given_name',
  },
  attributes: { family_name: 'Doe', given_name: 'Jane' },
  metadata: { type: 'HealthCard', issuer: 'https://issuer.example' },
  claimFormat: ClaimFormat.JwtVc,
  validUntil: undefined,
  validFrom: undefined,
  credentialSubject: {
    given_name: { display: [{ name: 'Given name' }] },
  },
  attributeOrder: ['given_name'],
}

describe('mapOpenIdCredentialToCardViewModel', () => {
  it('maps OpenID display metadata without an OCA dependency', () => {
    expect(mapOpenIdCredentialToCardViewModel(display, { revoked: true })).toMatchObject({
      id: 'w3c-credential-id',
      layout: 'card11',
      issuerName: 'Example Issuer',
      credentialName: 'Health Card',
      status: 'error',
      hideBrandingSlice: true,
      branding: {
        primaryBackgroundColor: '#123456',
        logoUri: 'https://example.com/issuer-logo.png',
        backgroundImageUri: 'https://example.com/background.png',
      },
      attributes: [
        { key: 'given_name', label: 'Given name', value: 'Jane' },
        { key: 'family_name', label: 'Family Name', value: 'Doe' },
      ],
      extraAttribute: { key: 'given_name', label: 'Given name', value: 'Jane' },
    })
  })
})
