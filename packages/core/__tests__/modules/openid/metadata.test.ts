import { ClaimFormat } from '@credo-ts/core'
import { Attribute } from '@bifold/oca/build/legacy'
import { extractOpenId4VcCredentialMetadata } from '../../../src/modules/openid/metadata'
import { buildFieldsFromW3cCredsCredential } from '../../../src/utils/oca'
import { W3cCredentialDisplay } from '../../../src/modules/openid/types'

describe('OpenID metadata', () => {
  test('extracts credential display, claim labels, and claim order from credential_metadata', () => {
    const result = extractOpenId4VcCredentialMetadata(
      {
        format: 'jwt_vc_json',
        credential_metadata: {
          display: [
            {
              name: 'University Credential',
              locale: 'en-US',
              logo: {
                url: 'https://issuer.example/logo.png',
                alt_text: 'University logo',
              },
              background_color: '#12107c',
              text_color: '#FFFFFF',
            },
          ],
          claims: [
            {
              path: ['degree'],
              display: [{ name: 'Degree', locale: 'en-US' }],
            },
            {
              path: ['given_name'],
              display: [{ name: 'Given Name', locale: 'en-US' }],
            },
            {
              path: ['gpa'],
              display: [{ name: 'GPA Score', locale: 'en-US' }],
            },
          ],
        },
      },
      {
        id: 'https://issuer.example',
        display: [{ name: 'Issuer Example' }],
      }
    )

    expect(result).toEqual({
      credential: {
        display: [
          {
            name: 'University Credential',
            locale: 'en-US',
            logo: {
              uri: 'https://issuer.example/logo.png',
              altText: 'University logo',
            },
            backgroundColor: '#12107c',
            textColor: '#FFFFFF',
          },
        ],
        order: ['degree', 'given_name', 'gpa'],
        credential_subject: {
          degree: { display: [{ name: 'Degree', locale: 'en-US' }] },
          given_name: { display: [{ name: 'Given Name', locale: 'en-US' }] },
          gpa: { display: [{ name: 'GPA Score', locale: 'en-US' }] },
        },
      },
      issuer: {
        id: 'https://issuer.example',
        display: [{ name: 'Issuer Example' }],
      },
    })
  })

  test('builds fields using OpenID claim order before remaining payload attributes', () => {
    const display: W3cCredentialDisplay = {
      id: 'sd-jwt-vc-test',
      createdAt: new Date('2026-05-29T00:00:00.000Z'),
      display: {
        name: 'ID Card',
        issuer: { name: 'Issuer Example' },
      },
      attributes: {
        something_nested: { key1: { key2: { key3: 'something nested' } } },
        source_document_type: 'id_card',
        status: { status_list: { idx: 1 } },
        age_is_over_16: true,
        family_name: 'Sparrow',
        given_name: 'Sally',
      },
      metadata: {
        type: 'ExampleIDCard',
        issuer: 'https://issuer.example',
      },
      claimFormat: ClaimFormat.SdJwtW3cVc,
      validUntil: undefined,
      validFrom: undefined,
      credentialSubject: {
        given_name: {
          display: [
            { name: 'Given Name', locale: 'en-US' },
            { name: 'Prenom', locale: 'fr-CA' },
          ],
        },
        family_name: { display: [{ name: 'Family Name' }] },
        age_is_over_16: { display: [{ name: 'Age 16 or Over' }] },
      },
      attributeOrder: ['given_name', 'family_name', 'age_is_over_16'],
    }

    const fields = buildFieldsFromW3cCredsCredential(display, undefined, 'fr') as Attribute[]

    expect(fields.map((field) => field.name)).toEqual([
      'Prenom',
      'Family Name',
      'Age 16 or Over',
      'something_nested',
      'source_document_type',
    ])
  })
})
