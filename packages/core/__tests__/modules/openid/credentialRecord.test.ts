import { ClaimFormat, MdocRecord, SdJwtVcRecord, W3cCredentialRecord, W3cV2CredentialRecord } from '@credo-ts/core'
import {
  getOpenIDCredentialClaimFormat,
  getOpenIDCredentialType,
  isOpenIDCredentialRecord,
  isOpenIdProofRequestRecord,
} from '../../../src/modules/openid/credentialRecord'
import { OpenIDCredentialType } from '../../../src/modules/openid/types'

const createRecord = <T extends object>(prototype: T, values: Record<string, unknown> = {}) =>
  Object.assign(Object.create(prototype), values)

describe('credentialRecord helpers', () => {
  test('isOpenIDCredentialRecord returns true for supported credential record types', () => {
    const w3cRecord = createRecord(W3cCredentialRecord.prototype)
    const w3cV2Record = createRecord(W3cV2CredentialRecord.prototype)
    const sdJwtRecord = createRecord(SdJwtVcRecord.prototype)
    const mdocRecord = createRecord(MdocRecord.prototype)

    expect(isOpenIDCredentialRecord(w3cRecord)).toBe(true)
    expect(isOpenIDCredentialRecord(w3cV2Record)).toBe(true)
    expect(isOpenIDCredentialRecord(sdJwtRecord)).toBe(true)
    expect(isOpenIDCredentialRecord(mdocRecord)).toBe(true)
    expect(isOpenIDCredentialRecord({})).toBe(false)
  })

  test('isOpenIdProofRequestRecord returns true only for OpenID proof request records', () => {
    expect(isOpenIdProofRequestRecord({ type: 'OpenId4VPRequestRecord' })).toBe(true)
    expect(isOpenIdProofRequestRecord({ type: 'OtherRecord' })).toBe(false)
    expect(isOpenIdProofRequestRecord(undefined)).toBe(false)
  })

  test('getOpenIDCredentialType returns the correct credential type for each record', () => {
    const w3cRecord = createRecord(W3cCredentialRecord.prototype)
    const w3cV2Record = createRecord(W3cV2CredentialRecord.prototype)
    const sdJwtRecord = createRecord(SdJwtVcRecord.prototype)
    const mdocRecord = createRecord(MdocRecord.prototype)

    expect(getOpenIDCredentialType(w3cRecord)).toBe(OpenIDCredentialType.W3cCredential)
    expect(getOpenIDCredentialType(w3cV2Record)).toBe('W3cV2CredentialRecord')
    expect(getOpenIDCredentialType(sdJwtRecord)).toBe(OpenIDCredentialType.SdJwtVc)
    expect(getOpenIDCredentialType(mdocRecord)).toBe(OpenIDCredentialType.Mdoc)
  })

  test('getOpenIDCredentialClaimFormat returns fixed formats for sd-jwt and mdoc records', () => {
    const sdJwtRecord = createRecord(SdJwtVcRecord.prototype)
    const mdocRecord = createRecord(MdocRecord.prototype)

    expect(getOpenIDCredentialClaimFormat(sdJwtRecord)).toBe(ClaimFormat.SdJwtW3cVc)
    expect(getOpenIDCredentialClaimFormat(mdocRecord)).toBe(ClaimFormat.MsoMdoc)
  })

  test('getOpenIDCredentialClaimFormat uses credential tags for w3c and w3c v2 records', () => {
    const w3cRecord = createRecord(W3cCredentialRecord.prototype, {
      getTags: jest.fn().mockReturnValue({ claimFormat: ClaimFormat.LdpVc }),
    })
    const w3cV2Record = createRecord(W3cV2CredentialRecord.prototype, {
      getTags: jest.fn().mockReturnValue({ claimFormat: ClaimFormat.JwtW3cVc }),
    })

    expect(getOpenIDCredentialClaimFormat(w3cRecord)).toBe(ClaimFormat.LdpVc)
    expect(getOpenIDCredentialClaimFormat(w3cV2Record)).toBe(ClaimFormat.JwtW3cVc)
  })

  test('getOpenIDCredentialClaimFormat falls back to JwtVc when tags are missing', () => {
    const w3cRecord = createRecord(W3cCredentialRecord.prototype, {
      getTags: jest.fn().mockReturnValue(undefined),
    })

    expect(getOpenIDCredentialClaimFormat(w3cRecord)).toBe(ClaimFormat.JwtVc)
  })
})
