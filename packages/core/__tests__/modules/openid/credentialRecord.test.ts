import { ClaimFormat, MdocRecord, SdJwtVcRecord, W3cCredentialRecord, W3cV2CredentialRecord } from '@credo-ts/core'
import {
  deleteOpenIDCredential,
  findOpenIDCredentialById,
  getOpenIDCredentialClaimFormat,
  getOpenIDCredentialById,
  getOpenIDCredentialType,
  isOpenIDCredentialRecord,
  isOpenIdProofRequestRecord,
  storeOpenIDCredential,
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

describe('credentialRecord repository routing', () => {
  const createAgentMock = () => ({
    w3cCredentials: {
      store: jest.fn(),
      deleteById: jest.fn(),
      getById: jest.fn(),
    },
    w3cV2Credentials: {
      store: jest.fn(),
      deleteById: jest.fn(),
      getById: jest.fn(),
    },
    sdJwtVc: {
      store: jest.fn(),
      deleteById: jest.fn(),
      getById: jest.fn(),
    },
    mdoc: {
      store: jest.fn(),
      deleteById: jest.fn(),
      getById: jest.fn(),
    },
  })

  const createTypedRecords = () => ({
    w3cRecord: createRecord(W3cCredentialRecord.prototype, { id: 'w3c-id' }),
    w3cV2Record: createRecord(W3cV2CredentialRecord.prototype, { id: 'w3c-v2-id' }),
    sdJwtRecord: createRecord(SdJwtVcRecord.prototype, { id: 'sd-jwt-id' }),
    mdocRecord: createRecord(MdocRecord.prototype, { id: 'mdoc-id' }),
  })

  test('storeOpenIDCredential stores each record in the correct repository', async () => {
    const agent = createAgentMock()
    const { w3cRecord, w3cV2Record, sdJwtRecord, mdocRecord } = createTypedRecords()

    await storeOpenIDCredential(agent as any, w3cRecord)
    await storeOpenIDCredential(agent as any, w3cV2Record)
    await storeOpenIDCredential(agent as any, sdJwtRecord)
    await storeOpenIDCredential(agent as any, mdocRecord)

    expect(agent.w3cCredentials.store).toHaveBeenCalledWith({ record: w3cRecord })
    expect(agent.w3cV2Credentials.store).toHaveBeenCalledWith({ record: w3cV2Record })
    expect(agent.sdJwtVc.store).toHaveBeenCalledWith({ record: sdJwtRecord })
    expect(agent.mdoc.store).toHaveBeenCalledWith({ record: mdocRecord })
  })

  test('deleteOpenIDCredential deletes each record from the correct repository', async () => {
    const agent = createAgentMock()
    const { w3cRecord, w3cV2Record, sdJwtRecord, mdocRecord } = createTypedRecords()

    await deleteOpenIDCredential(agent as any, w3cRecord)
    await deleteOpenIDCredential(agent as any, w3cV2Record)
    await deleteOpenIDCredential(agent as any, sdJwtRecord)
    await deleteOpenIDCredential(agent as any, mdocRecord)

    expect(agent.w3cCredentials.deleteById).toHaveBeenCalledWith('w3c-id')
    expect(agent.w3cV2Credentials.deleteById).toHaveBeenCalledWith('w3c-v2-id')
    expect(agent.sdJwtVc.deleteById).toHaveBeenCalledWith('sd-jwt-id')
    expect(agent.mdoc.deleteById).toHaveBeenCalledWith('mdoc-id')
  })

  test('getOpenIDCredentialById routes each credential type to the correct repository', async () => {
    const agent = createAgentMock()
    const { w3cRecord, w3cV2Record, sdJwtRecord, mdocRecord } = createTypedRecords()

    agent.w3cCredentials.getById.mockResolvedValue(w3cRecord)
    agent.w3cV2Credentials.getById.mockResolvedValue(w3cV2Record)
    agent.sdJwtVc.getById.mockResolvedValue(sdJwtRecord)
    agent.mdoc.getById.mockResolvedValue(mdocRecord)

    await expect(getOpenIDCredentialById(agent as any, OpenIDCredentialType.W3cCredential, 'w3c-id')).resolves.toBe(
      w3cRecord
    )
    await expect(getOpenIDCredentialById(agent as any, 'W3cV2CredentialRecord', 'w3c-v2-id')).resolves.toBe(
      w3cV2Record
    )
    await expect(getOpenIDCredentialById(agent as any, OpenIDCredentialType.SdJwtVc, 'sd-jwt-id')).resolves.toBe(
      sdJwtRecord
    )
    await expect(getOpenIDCredentialById(agent as any, OpenIDCredentialType.Mdoc, 'mdoc-id')).resolves.toBe(
      mdocRecord
    )
    await expect(getOpenIDCredentialById(agent as any, 999 as any, 'unknown-id')).resolves.toBeUndefined()

    expect(agent.w3cCredentials.getById).toHaveBeenCalledWith('w3c-id')
    expect(agent.w3cV2Credentials.getById).toHaveBeenCalledWith('w3c-v2-id')
    expect(agent.sdJwtVc.getById).toHaveBeenCalledWith('sd-jwt-id')
    expect(agent.mdoc.getById).toHaveBeenCalledWith('mdoc-id')
  })

  test('findOpenIDCredentialById returns the first fulfilled credential across repositories', async () => {
    const agent = createAgentMock()
    const { sdJwtRecord } = createTypedRecords()

    agent.w3cCredentials.getById.mockRejectedValue(new Error('not found'))
    agent.w3cV2Credentials.getById.mockRejectedValue(new Error('not found'))
    agent.sdJwtVc.getById.mockResolvedValue(sdJwtRecord)
    agent.mdoc.getById.mockRejectedValue(new Error('not found'))

    await expect(findOpenIDCredentialById(agent as any, 'sd-jwt-id')).resolves.toBe(sdJwtRecord)
  })

  test('findOpenIDCredentialById returns undefined when no repository resolves a credential', async () => {
    const agent = createAgentMock()

    agent.w3cCredentials.getById.mockRejectedValue(new Error('not found'))
    agent.w3cV2Credentials.getById.mockRejectedValue(new Error('not found'))
    agent.sdJwtVc.getById.mockRejectedValue(new Error('not found'))
    agent.mdoc.getById.mockRejectedValue(new Error('not found'))

    await expect(findOpenIDCredentialById(agent as any, 'missing-id')).resolves.toBeUndefined()
  })
})
