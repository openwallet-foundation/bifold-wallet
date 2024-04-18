import {
  AnonCredsCredentialTags,
  AnonCredsCredentialsForProofRequest,
  getAnonCredsTagsFromRecord,
} from '@credo-ts/anoncreds'
import {
  DescriptorMetadata,
  DifPexAnonCredsProofRequest,
  createAnonCredsProofRequest,
  filterInvalidProofRequestMatches,
  getDescriptorMetadata,
} from '../../App/utils/anonCredsProofRequestMapper'
import {
  testPresentationDefinition1,
  testW3cCredentialRecord,
  testW3cCredentialRecord2,
} from '../screens/fixtures/w3c-proof-request'
import { ClaimFormat } from '@credo-ts/core'

describe('getDescriptorMetadata', () => {
  test('Returns Correct DescriptorMetadata', async () => {
    const record1 = testW3cCredentialRecord
    const record2 = testW3cCredentialRecord2

    const result = getDescriptorMetadata({
      areRequirementsSatisfied: true,
      requirements: [
        {
          isRequirementSatisfied: true,
          needsCount: 1,
          rule: 'all',
          submissionEntry: [
            { inputDescriptorId: '0', verifiableCredentials: [{ credentialRecord: record1, type: ClaimFormat.LdpVc }] },
          ],
        },
        {
          isRequirementSatisfied: true,
          needsCount: 1,
          rule: 'all',
          submissionEntry: [
            { inputDescriptorId: '1', verifiableCredentials: [{ credentialRecord: record2, type: ClaimFormat.LdpVc }] },
          ],
        },
        {
          isRequirementSatisfied: true,
          needsCount: 1,
          rule: 'all',
          submissionEntry: [
            {
              inputDescriptorId: '2',
              verifiableCredentials: [
                { credentialRecord: record1, type: ClaimFormat.LdpVc },
                { credentialRecord: record2, type: ClaimFormat.LdpVc },
              ],
            },
          ],
        },
      ],
    })

    const expected: DescriptorMetadata = {
      '0': [{ record: record1, anonCredsTags: getAnonCredsTagsFromRecord(record1) as AnonCredsCredentialTags }],
      '1': [{ record: record2, anonCredsTags: getAnonCredsTagsFromRecord(record2) as AnonCredsCredentialTags }],
      '2': [
        { record: record1, anonCredsTags: getAnonCredsTagsFromRecord(record1) as AnonCredsCredentialTags },
        { record: record2, anonCredsTags: getAnonCredsTagsFromRecord(record2) as AnonCredsCredentialTags },
      ],
    }
    expect(result).toStrictEqual(expected)
  })

  test('Returns Correct AnonCredsProofRequest', async () => {
    const record1 = testW3cCredentialRecord

    const pd = testPresentationDefinition1
    const anonCredsTags = getAnonCredsTagsFromRecord(record1) as AnonCredsCredentialTags

    const descriptorMetadata: DescriptorMetadata = {
      email: [{ record: record1, anonCredsTags }],
      time: [{ record: record1, anonCredsTags }],
      age: [{ record: record1, anonCredsTags }],
    }

    const anonCredsProofRequest = createAnonCredsProofRequest(pd, descriptorMetadata)

    const expectedAnonCredsProofRequest: DifPexAnonCredsProofRequest = {
      version: '1.0',
      name: 'Age Verification',
      nonce: 'nonce',
      requested_attributes: {
        email: {
          names: ['email'],
          restrictions: [
            {
              schema_id:
                'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
              cred_def_id: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
            },
          ],
          non_revoked: undefined,
          descriptorId: 'email',
        },
        time: {
          names: ['time'],
          restrictions: [
            {
              schema_id:
                'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
              cred_def_id: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
            },
          ],
          non_revoked: undefined,
          descriptorId: 'time',
        },
      },
      requested_predicates: {
        age_0: {
          name: 'age',
          p_type: '<=',
          p_value: 18,
          restrictions: [
            {
              schema_id:
                'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
              cred_def_id: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
            },
          ],
          non_revoked: undefined,
          descriptorId: 'age',
        },
      },
    }
    expect(anonCredsProofRequest).toStrictEqual(expectedAnonCredsProofRequest)
  })

  test('Returns Correct filteredProofRequestMatches', async () => {
    const record1 = testW3cCredentialRecord

    const anonCredsCredentialsForRequest = {
      attributes: {
        email: [{ credentialId: '1' }],
        time: [{ credentialId: '2' }, { credentialId: '5' }],
      },
      predicates: {
        age_0: [{ credentialId: '3' }, { credentialId: '4' }],
        age2_0: [{ credentialId: '3' }, { credentialId: '4' }, { credentialId: '6' }],
      },
    } as unknown as AnonCredsCredentialsForProofRequest

    const descriptorMetadata = {
      email: [{ record: { id: '1' }, anonCredsTags: {} }],
      time: [{ record: { id: '5' }, anonCredsTags: {} }],
      age: [
        { record: { id: '3' }, anonCredsTags: {} },
        { record: { id: '4' }, anonCredsTags: {} },
      ],
      age2: [],
    } as unknown as DescriptorMetadata

    const result = filterInvalidProofRequestMatches(anonCredsCredentialsForRequest, descriptorMetadata)

    const expected = {
      attributes: {
        email: [{ credentialId: '1' }],
        time: [{ credentialId: '5' }],
      },
      predicates: {
        age_0: [{ credentialId: '3' }, { credentialId: '4' }],
        age2_0: [],
      },
    } as unknown as AnonCredsCredentialsForProofRequest

    expect(result).toStrictEqual(expected)
  })
})
