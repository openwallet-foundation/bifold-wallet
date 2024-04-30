import { AnonCredsCredentialsForProofRequest } from '@credo-ts/anoncreds'
import { ClaimFormat, DifPexCredentialsForRequest, JsonTransformer, W3cCredentialRecord } from '@credo-ts/core'
import { DifPexAnonCredsProofRequest } from '../../../App/utils/anonCredsProofRequestMapper'

export const testW3cCredentialRecord = JsonTransformer.fromJSON(
  {
    _tags: {
      anonCredsAttr: [':age::marker', ':email::marker', ':time::marker'],
      'anonCredsAttr::age::value': '16',
      'anonCredsAttr::email::value': 'test@email.com',
      'anonCredsAttr::time::value': '2022-02-11 20:00:18.180718',
      anonCredsCredentialDefinitionId:
        'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
      anonCredsLinkSecretId: '278e4591-71cf-4158-9ea0-7aba860cf8c5',
      anonCredsMethodName: 'indy',
      anonCredsSchemaId:
        'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
      anonCredsSchemaIssuerId: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k',
      anonCredsSchemaName: 'Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c',
      anonCredsSchemaVersion: '1.0.0',
      anonCredsUnqualifiedCredentialDefinitionId: 'TfuPA6whW681GfU6fj1e3k:3:CL:462230:latest',
      anonCredsUnqualifiedIssuerId: 'TfuPA6whW681GfU6fj1e3k',
      anonCredsUnqualifiedSchemaId:
        'TfuPA6whW681GfU6fj1e3k:2:Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c:1.0.0',
      anonCredsUnqualifiedSchemaIssuerId: 'TfuPA6whW681GfU6fj1e3k',
      claimFormat: 'ldp_vc',
      contexts: ['https://w3id.org/security/data-integrity/v2', 'https://www.w3.org/2018/credentials/v1'],
      cryptosuites: ['anoncreds-2023'],
      expandedTypes: ['https://www.w3.org/2018/credentials#VerifiableCredential'],
      issuerId: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k',
      proofTypes: ['DataIntegrityProof'],
      types: ['VerifiableCredential'],
    },
    type: 'W3cCredentialRecord',
    metadata: {
      '_w3c/anonCredsMetadata': { linkSecretId: '278e4591-71cf-4158-9ea0-7aba860cf8c5', methodName: 'indy' },
    },
    id: '8eba4449-8a85-4954-b11c-e0590f39cbdb',
    createdAt: 'Thu Mar 14 2024 19:04:55 GMT+0100',
    credential: {
      context: [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/data-integrity/v2',
        { '@vocab': 'https://www.w3.org/ns/credentials/issuer-dependent#' },
      ],
      type: ['VerifiableCredential'],
      issuer: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k',
      credentialSubject: {
        id: undefined,
        claims: { age: 16, time: '2022-02-11 20:00:18.180718', email: 'test@email.com' },
      },
      proof: [
        {
          cryptosuite: 'anoncreds-2023',
          type: 'DataIntegrityProof',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          proofValue:
            'ukgGEqXNjaGVtYV9pZNl6ZGlkOmluZHk6YmNvdnJpbjp0ZXN0OlRmdVBBNndoVzY4MUdmVTZmajFlM2svYW5vbmNyZWRzL3YwL1NDSEVNQS9JZGVudGl0eSBTY2hlbWFhZjkyYWY5Mi01MjRkLTQxYjYtYmVlOC0wMGZiNDVlOGViNmMvMS4wLjCrY3JlZF9kZWZfaWTZUWRpZDppbmR5OmJjb3ZyaW46dGVzdDpUZnVQQTZ3aFc2ODFHZlU2ZmoxZTNrL2Fub25jcmVkcy92MC9DTEFJTV9ERUYvNDYyMjMwL2xhdGVzdKlzaWduYXR1cmWCrHBfY3JlZGVudGlhbISjbV8y3AAgzPJOcMylzNpDRl_MsgQyzOEZJMyyV8y6FEvM63AUBV1uzPIhTAXMv8z6N6Fh3AEAcXnMnDjMmMzZSxt-UMyMSsy6NGAZzILMrmclzM47zI7M6DnM4czHcRcVLADMwczsShUXZWPMow_MhMzCPszEbMzoazxSXwU7HjxVzIzMk8yrzPULTEHM88yYJiBTzK0ozPs6V1padMzWVszWzJ7MysylNG3MxHJtemXM-lBgzIXM-gfMyEozzIA0PDLMoMyizL7MvcybzM0ZzKx6zL_Mu8zVLMylzLUaLyUrecyDZczjzMnM3h3M68zBdMzyzOQuAsySzJgMzIciF0hNLMy3D8zmF8z_NszLCT3MrWrMsMyhD8yhzL3M63ZAb8yYC8ybzMvMw3MszLXMvsyabjQvzPVEDW3M2CoRzOPMqXoMIMy7zJ0gAMyizKR2zITMqDLM78ybzNElzJTMv8zozNBwzKDMiTbM-BdqzO7Mn8ywzLNGzKHMzcyTP1TMm8zAOjksfsz1zO90zJZTzPfM2szLzNzMz8ylPF7MtU82zInMzhQhzKB_WkHMswShZdwASxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoGzM4GP8zAzOHM7Mzqfgw3zIfM6ymhdtwBVQjMiMziM8ytzLzMi8zbWcywzOfM1syizPpYLMzbfFDMr8zbG8ygaR1eVMzHalvMt0YjzLVbTU0fETXM7MzYQ8zezIDM0cyUzNlxzIdrzOzMisyQzMDMiXN_NszAzMFBNQbMsiwJFcz7fRY2cBzMssywzMfM2MzrDn0tzIRwzODMqAXMr0VvXMzLK8yrby0XzJx8zOnMwcypZ8y1zIvM0MyNzNdcQsyqzNBGzKHM0GDMgcz7NEIzMDoazKPMzcyizKDM88zOzIPMvczwzJAISDl_XsyEzP3Mm3bM0nZGQ8yTzLhAJAfMqcyBH0gfzPdtRcz4PMyjzN92Y8y7C3zM0czEzP0IzNJ_zMMWzOFAzOLMgcyAQysEeszdacysfAp0zOMHzMNOzLLM4kc3OcyqzLTMoczWzJTMxl8pMn3MwE1bzI3M8syLzNPM3My3zK_MsGU1zO5TLczaOcy9zM3Mk8y7zMsTbsyKT8zyzMcWeSbM0iwuzITMz8zTBMyFTszEK8zOHwBgSlhnL8zVzLDMuXhNBCzM_8z6zJV2zLnMqCMlzP8gLMzCzMcGQnzMjsz3zOzM_8yCSUcJzIvMxSROzKPM13guCcz3Q1HM48ztNWDM5szGzJHMqinMvczpzMzMm8yUzK_MmVXM38ztV2zM1cz4KF7M7xjMrszQzMMhzI4vzOXMksyurHJfY3JlZGVudGlhbMC7c2lnbmF0dXJlX2NvcnJlY3RuZXNzX3Byb29mgqJzZdwBAMzCfsydAwBHFMz4PczVzJZoGMyQbhHMy3tIzK_M7mjMvjLM78zTGszOzMvM9szcEk5NWMyHKsz0aUHMgcycYczozLhYzKtUMDUCzIlKFcyhzK3M-8yMzPwLzOLM9czlQDQOzIDM_hNEzMbMy8zqzOPMiszJzPLMhHJizOxOzJQdzLw-zJh4zKzMwMyQzL7MqljMmMzAzNIkCMyuzKBlzIvMxHxNzPYvzN3MscyhzMFXzNTMiMzwzLNHJczBIA87F8y1zIzMtsyXzLcWzNh8zPN1zNPMjczbzNQkW8yQH2TM5lgHzL44zNrMxybMuMyBzOoMZi3M517M0DzMyMyBYEjMz8z6G3_MsMy9zJ3M18yscjfMmMzhYkDMzXnM08yrzL7Mvcz2WHkBzOljKQvMgMz5zO88VhXM-1UyA2bMh8zZN39OJcykzI0IBcyQzJDMvTLM8hMQzLzMucyLR8yVCG8JzLcpzM45zPVozOVCCMzRzNTMq2JKHszxEMygZlXMylrM8xoIzP2hY9wAIMz_zJNKzNbMksznzM3MyXM0zNzMlWbM9z7MjSkKYszvzKBnzMTM3MydzLrM-cyFzMQcYczG',
        },
      ],
      issuanceDate: '2024-03-14T18:04:55.540134Z',
    },
    updatedAt: 'Thu Mar 14 2024 19:04:55 GMT+0100',
  },
  W3cCredentialRecord
)

export const testW3cCredentialRecord2 = JsonTransformer.fromJSON(
  {
    _tags: {
      anonCredsAttr: [':age::marker', ':email::marker', ':time::marker'],
      'anonCredsAttr::age::value': '17',
      'anonCredsAttr::email::value': 'test2@email.com',
      'anonCredsAttr::time::value': '2023-02-11 20:00:18.180718',
      anonCredsCredentialDefinitionId:
        'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
      anonCredsLinkSecretId: '278e4591-71cf-4158-9ea0-7aba860cf8c5',
      anonCredsMethodName: 'indy',
      anonCredsSchemaId:
        'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
      anonCredsSchemaIssuerId: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k',
      anonCredsSchemaName: 'Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c',
      anonCredsSchemaVersion: '1.0.0',
      anonCredsUnqualifiedCredentialDefinitionId: 'TfuPA6whW681GfU6fj1e3k:3:CL:462230:latest',
      anonCredsUnqualifiedIssuerId: 'TfuPA6whW681GfU6fj1e3k',
      anonCredsUnqualifiedSchemaId:
        'TfuPA6whW681GfU6fj1e3k:2:Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c:1.0.0',
      anonCredsUnqualifiedSchemaIssuerId: 'TfuPA6whW681GfU6fj1e3k',
      claimFormat: 'ldp_vc',
      contexts: ['https://w3id.org/security/data-integrity/v2', 'https://www.w3.org/2018/credentials/v1'],
      cryptosuites: ['anoncreds-2023'],
      expandedTypes: ['https://www.w3.org/2018/credentials#VerifiableCredential'],
      issuerId: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k',
      proofTypes: ['DataIntegrityProof'],
      types: ['VerifiableCredential'],
    },
    type: 'W3cCredentialRecord',
    metadata: {
      '_w3c/anonCredsMetadata': { linkSecretId: '278e4591-71cf-4158-9ea0-7aba860cf8c5', methodName: 'indy' },
    },
    id: '8eba4449-8a85-4954-b11c-e0590f39cbdc',
    createdAt: 'Thu Mar 14 2024 19:04:55 GMT+0100',
    credential: {
      context: [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/data-integrity/v2',
        { '@vocab': 'https://www.w3.org/ns/credentials/issuer-dependent#' },
      ],
      type: ['VerifiableCredential'],
      issuer: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k',
      credentialSubject: {
        id: undefined,
        claims: { age: 17, time: '2023-02-11 20:00:18.180718', email: 'test2@email.com' },
      },
      proof: [
        {
          cryptosuite: 'anoncreds-2023',
          type: 'DataIntegrityProof',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          proofValue:
            'ukgGEqXNjaGVtYV9pZNl6ZGlkOmluZHk6YmNvdnJpbjp0ZXN0OlRmdVBBNndoVzY4MUdmVTZmajFlM2svYW5vbmNyZWRzL3YwL1NDSEVNQS9JZGVudGl0eSBTY2hlbWFhZjkyYWY5Mi01MjRkLTQxYjYtYmVlOC0wMGZiNDVlOGViNmMvMS4wLjCrY3JlZF9kZWZfaWTZUWRpZDppbmR5OmJjb3ZyaW46dGVzdDpUZnVQQTZ3aFc2ODFHZlU2ZmoxZTNrL2Fub25jcmVkcy92MC9DTEFJTV9ERUYvNDYyMjMwL2xhdGVzdKlzaWduYXR1cmWCrHBfY3JlZGVudGlhbISjbV8y3AAgzPJOcMylzNpDRl_MsgQyzOEZJMyyV8y6FEvM63AUBV1uzPIhTAXMv8z6N6Fh3AEAcXnMnDjMmMzZSxt-UMyMSsy6NGAZzILMrmclzM47zI7M6DnM4czHcRcVLADMwczsShUXZWPMow_MhMzCPszEbMzoazxSXwU7HjxVzIzMk8yrzPULTEHM88yYJiBTzK0ozPs6V1padMzWVszWzJ7MysylNG3MxHJtemXM-lBgzIXM-gfMyEozzIA0PDLMoMyizL7MvcybzM0ZzKx6zL_Mu8zVLMylzLUaLyUrecyDZczjzMnM3h3M68zBdMzyzOQuAsySzJgMzIciF0hNLMy3D8zmF8z_NszLCT3MrWrMsMyhD8yhzL3M63ZAb8yYC8ybzMvMw3MszLXMvsyabjQvzPVEDW3M2CoRzOPMqXoMIMy7zJ0gAMyizKR2zITMqDLM78ybzNElzJTMv8zozNBwzKDMiTbM-BdqzO7Mn8ywzLNGzKHMzcyTP1TMm8zAOjksfsz1zO90zJZTzPfM2szLzNzMz8ylPF7MtU82zInMzhQhzKB_WkHMswShZdwASxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoGzM4GP8zAzOHM7Mzqfgw3zIfM6ymhdtwBVQjMiMziM8ytzLzMi8zbWcywzOfM1syizPpYLMzbfFDMr8zbG8ygaR1eVMzHalvMt0YjzLVbTU0fETXM7MzYQ8zezIDM0cyUzNlxzIdrzOzMisyQzMDMiXN_NszAzMFBNQbMsiwJFcz7fRY2cBzMssywzMfM2MzrDn0tzIRwzODMqAXMr0VvXMzLK8yrby0XzJx8zOnMwcypZ8y1zIvM0MyNzNdcQsyqzNBGzKHM0GDMgcz7NEIzMDoazKPMzcyizKDM88zOzIPMvczwzJAISDl_XsyEzP3Mm3bM0nZGQ8yTzLhAJAfMqcyBH0gfzPdtRcz4PMyjzN92Y8y7C3zM0czEzP0IzNJ_zMMWzOFAzOLMgcyAQysEeszdacysfAp0zOMHzMNOzLLM4kc3OcyqzLTMoczWzJTMxl8pMn3MwE1bzI3M8syLzNPM3My3zK_MsGU1zO5TLczaOcy9zM3Mk8y7zMsTbsyKT8zyzMcWeSbM0iwuzITMz8zTBMyFTszEK8zOHwBgSlhnL8zVzLDMuXhNBCzM_8z6zJV2zLnMqCMlzP8gLMzCzMcGQnzMjsz3zOzM_8yCSUcJzIvMxSROzKPM13guCcz3Q1HM48ztNWDM5szGzJHMqinMvczpzMzMm8yUzK_MmVXM38ztV2zM1cz4KF7M7xjMrszQzMMhzI4vzOXMksyurHJfY3JlZGVudGlhbMC7c2lnbmF0dXJlX2NvcnJlY3RuZXNzX3Byb29mgqJzZdwBAMzCfsydAwBHFMz4PczVzJZoGMyQbhHMy3tIzK_M7mjMvjLM78zTGszOzMvM9szcEk5NWMyHKsz0aUHMgcycYczozLhYzKtUMDUCzIlKFcyhzK3M-8yMzPwLzOLM9czlQDQOzIDM_hNEzMbMy8zqzOPMiszJzPLMhHJizOxOzJQdzLw-zJh4zKzMwMyQzL7MqljMmMzAzNIkCMyuzKBlzIvMxHxNzPYvzN3MscyhzMFXzNTMiMzwzLNHJczBIA87F8y1zIzMtsyXzLcWzNh8zPN1zNPMjczbzNQkW8yQH2TM5lgHzL44zNrMxybMuMyBzOoMZi3M517M0DzMyMyBYEjMz8z6G3_MsMy9zJ3M18yscjfMmMzhYkDMzXnM08yrzL7Mvcz2WHkBzOljKQvMgMz5zO88VhXM-1UyA2bMh8zZN39OJcykzI0IBcyQzJDMvTLM8hMQzLzMucyLR8yVCG8JzLcpzM45zPVozOVCCMzRzNTMq2JKHszxEMygZlXMylrM8xoIzP2hY9wAIMz_zJNKzNbMksznzM3MyXM0zNzMlWbM9z7MjSkKYszvzKBnzMTM3MydzLrM-cyFzMQcYczG',
        },
      ],
      issuanceDate: '2024-03-14T18:04:55.540134Z',
    },
    updatedAt: 'Thu Mar 14 2024 19:04:55 GMT+0100',
  },
  W3cCredentialRecord
)

export const anonCredsPresentationRequest: DifPexAnonCredsProofRequest = {
  version: '1.0',
  name: 'Age Verification',
  nonce: 'nonce',
  requested_attributes: {
    email: {
      names: ['email'],
      restrictions: [
        {
          cred_def_id: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          schema_id:
            'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
        },
      ],
      non_revoked: undefined,
      descriptorId: 'email',
    },
    time: {
      names: ['time'],
      restrictions: [
        {
          cred_def_id: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          schema_id:
            'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
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
          cred_def_id: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          schema_id:
            'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
        },
      ],
      non_revoked: undefined,
      descriptorId: 'age',
    },
  },
}

export const anonCredsCredentialsForProofRequest: AnonCredsCredentialsForProofRequest = {
  attributes: {
    email: [
      {
        credentialId: '8eba4449-8a85-4954-b11c-e0590f39cbdb',
        revealed: true,
        credentialInfo: {
          attributes: { age: 16, time: '2022-02-11 20:00:18.180718', email: 'test@email.com' },
          credentialId: '8eba4449-8a85-4954-b11c-e0590f39cbdb',
          credentialDefinitionId: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          schemaId:
            'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
          credentialRevocationId: null,
          revocationRegistryId: null,
          methodName: 'indy',
          linkSecretId: '278e4591-71cf-4158-9ea0-7aba860cf8c5',
          createdAt: new Date('Thu Mar 14 2024 19:04:55 GMT+0100'),
          updatedAt: new Date('Thu Mar 14 2024 19:04:55 GMT+0100'),
        },
        timestamp: undefined,
        revoked: undefined,
      },
    ],
    time: [
      {
        credentialId: '8eba4449-8a85-4954-b11c-e0590f39cbdb',
        revealed: true,
        credentialInfo: {
          attributes: { age: 16, time: '2022-02-11 20:00:18.180718', email: 'test@email.com' },
          credentialId: '8eba4449-8a85-4954-b11c-e0590f39cbdb',
          credentialDefinitionId: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          schemaId:
            'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
          credentialRevocationId: null,
          revocationRegistryId: null,
          methodName: 'indy',
          linkSecretId: '278e4591-71cf-4158-9ea0-7aba860cf8c5',
          createdAt: new Date('Thu Mar 14 2024 19:04:55 GMT+0100'),
          updatedAt: new Date('Thu Mar 14 2024 19:04:55 GMT+0100'),
        },
        timestamp: undefined,
        revoked: undefined,
      },
    ],
  },
  predicates: {
    age_0: [
      {
        credentialId: '8eba4449-8a85-4954-b11c-e0590f39cbdb',
        credentialInfo: {
          attributes: { age: 16, time: '2022-02-11 20:00:18.180718', email: 'test@email.com' },
          credentialId: '8eba4449-8a85-4954-b11c-e0590f39cbdb',
          credentialDefinitionId: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          schemaId:
            'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/SCHEMA/Identity Schemaaf92af92-524d-41b6-bee8-00fb45e8eb6c/1.0.0',
          credentialRevocationId: null,
          revocationRegistryId: null,
          methodName: 'indy',
          linkSecretId: '278e4591-71cf-4158-9ea0-7aba860cf8c5',
          createdAt: new Date('Thu Mar 14 2024 19:04:55 GMT+0100'),
          updatedAt: new Date('Thu Mar 14 2024 19:04:55 GMT+0100'),
        },
        timestamp: undefined,
        revoked: undefined,
      },
    ],
  },
}

export const difPexCredentialsForRequest: DifPexCredentialsForRequest = {
  areRequirementsSatisfied: true,
  name: 'Age Verification',
  purpose: 'We need to verify your age before entering a bar',
  requirements: [
    {
      rule: 'pick',
      needsCount: 1,
      submissionEntry: [
        {
          inputDescriptorId: 'age',
          name: undefined,
          purpose: undefined,
          verifiableCredentials: [{ type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord }],
        },
      ],
      isRequirementSatisfied: true,
    },
    {
      rule: 'pick',
      needsCount: 1,
      submissionEntry: [
        {
          inputDescriptorId: 'email',
          name: undefined,
          purpose: undefined,
          verifiableCredentials: [{ type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord }],
        },
      ],
      isRequirementSatisfied: true,
    },
    {
      rule: 'pick',
      needsCount: 1,
      submissionEntry: [
        {
          inputDescriptorId: 'time',
          name: undefined,
          purpose: undefined,
          verifiableCredentials: [{ type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord }],
        },
      ],
      isRequirementSatisfied: true,
    },
  ],
}

export const difPexCredentialsForRequest2: DifPexCredentialsForRequest = {
  areRequirementsSatisfied: true,
  name: 'Age Verification2',
  purpose: 'We need to verify your age before entering a bar2',
  requirements: [
    {
      rule: 'pick',
      needsCount: 1,
      submissionEntry: [
        {
          inputDescriptorId: 'age',
          name: undefined,
          purpose: undefined,
          verifiableCredentials: [
            { type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord },
            { type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord2 },
          ],
        },
      ],
      isRequirementSatisfied: true,
    },
    {
      rule: 'pick',
      needsCount: 1,
      submissionEntry: [
        {
          inputDescriptorId: 'email',
          name: undefined,
          purpose: undefined,
          verifiableCredentials: [
            { type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord },
            { type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord2 },
          ],
        },
      ],
      isRequirementSatisfied: true,
    },
    {
      rule: 'pick',
      needsCount: 1,
      submissionEntry: [
        {
          inputDescriptorId: 'time',
          name: undefined,
          purpose: undefined,
          verifiableCredentials: [
            { type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord },
            { type: ClaimFormat.LdpVc, credentialRecord: testW3cCredentialRecord2 },
          ],
        },
      ],
      isRequirementSatisfied: true,
    },
  ],
}

export const testPresentationDefinition1 = {
  id: '5591656f-5b5d-40f8-ab5c-9041c8e3a6a0',
  name: 'Age Verification',
  purpose: 'We need to verify your age before entering a bar',
  input_descriptors: [
    {
      id: 'age',
      schema: [{ uri: 'https://www.w3.org/2018/credentials/v1' }],
      constraints: {
        limit_disclosure: 'required' as const,
        fields: [
          {
            path: ['$.credentialSubject.age'],
            predicate: 'preferred' as const,
            filter: { type: 'number', maximum: 18 },
          },
          {
            path: ['$.proof[0].verificationMethod'],
            const: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          },
        ],
      },
    },
    {
      id: 'email',
      schema: [{ uri: 'https://www.w3.org/2018/credentials/v1' }],
      constraints: {
        limit_disclosure: 'required' as const,
        fields: [
          { path: ['$.credentialSubject.email'] },
          {
            path: ['$.proof[0].verificationMethod'],
            const: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
          },
        ],
      },
    },
    {
      id: 'time',
      schema: [{ uri: 'https://www.w3.org/2018/credentials/v1' }],
      constraints: {
        limit_disclosure: 'required' as const,
        fields: [
          { path: ['$.credentialSubject.time'] },
          {
            path: ['$.proof[0].verificationMethod'],
            filter: {
              type: 'string',
              const: 'did:indy:bcovrin:test:TfuPA6whW681GfU6fj1e3k/anoncreds/v0/CLAIM_DEF/462230/latest',
            },
          },
        ],
      },
    },
  ],
}
