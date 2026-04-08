import {
  ClaimFormat,
  type DcqlQueryResult,
  type DcqlValidCredential,
  type DifPexCredentialsForRequest,
} from '@credo-ts/core'

import { filterAndMapSdJwtKeys, getCredentialForDisplay } from './display'
import { OpenIDCredentialRecord } from './credentialRecord'
import { FormattedSubmission, FormattedSubmissionEntry, OpenId4VPRequestRecord } from './types'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const flattenMdocDisclosedPayload = (value: unknown): Record<string, unknown> =>
  Object.fromEntries(
    Object.values(asRecord(value)).flatMap((entry) =>
      entry && typeof entry === 'object' && !Array.isArray(entry) ? Object.entries(entry) : []
    )
  )

const getDcqlClaimFormat = (record: OpenIDCredentialRecord): ClaimFormat => {
  switch (record.type) {
    case 'MdocRecord':
      return ClaimFormat.MsoMdoc
    case 'SdJwtVcRecord':
      return ClaimFormat.SdJwtDc
    default:
      return record.firstCredential.claimFormat
  }
}

const getDcqlDisclosedPayload = (validCredential: DcqlValidCredential): Record<string, unknown> => {
  const output = validCredential.claims.valid_claim_sets[0].output

  if (validCredential.record.type === 'MdocRecord') {
    return flattenMdocDisclosedPayload(output)
  }

  if (validCredential.record.type === 'SdJwtVcRecord') {
    return filterAndMapSdJwtKeys(asRecord(output)).visibleProperties
  }

  return asRecord(output)
}

export function formatDcqlCredentialsForRequest(queryResult: DcqlQueryResult): FormattedSubmission {
  const entries = queryResult.credentials.map((credentialQuery): FormattedSubmissionEntry => {
    const match = queryResult.credential_matches[credentialQuery.id]
    const validCredentials: DcqlValidCredential[] = match?.success ? Array.from(match.valid_credentials) : []

    return {
      inputDescriptorId: credentialQuery.id,
      name: credentialQuery.id,
      purpose: undefined,
      description: undefined,
      isSatisfied: validCredentials.length >= 1,
      credentials: validCredentials.map((validCredential) => {
        const { display, metadata } = getCredentialForDisplay(validCredential.record)
        const disclosedPayload = getDcqlDisclosedPayload(validCredential)

        return {
          id: validCredential.record.id,
          credentialName: display.name,
          issuerName: display.issuer.name,
          requestedAttributes: [...Object.keys(disclosedPayload)],
          metadata,
          backgroundColor: display.backgroundColor,
          textColor: display.textColor,
          backgroundImage: display.backgroundImage,
          claimFormat: getDcqlClaimFormat(validCredential.record),
        }
      }),
    }
  })

  return {
    areAllSatisfied: queryResult.can_be_satisfied,
    name: 'Unknown',
    purpose: undefined,
    entries,
  }
}

export function formatDifPexCredentialsForRequest(
  credentialsForRequest: DifPexCredentialsForRequest
): FormattedSubmission {
  const entries = credentialsForRequest.requirements.flatMap((requirement) => {
    return requirement.submissionEntry.map((submission): FormattedSubmissionEntry => {
      return {
        inputDescriptorId: submission.inputDescriptorId,
        name: submission.name ?? 'Unknown',
        purpose: submission.purpose,
        description: submission.purpose,
        isSatisfied: submission.verifiableCredentials.length >= 1,

        credentials: submission.verifiableCredentials.map((verifiableCredential) => {
          const { display, attributes, metadata, claimFormat } = getCredentialForDisplay(
            verifiableCredential.credentialRecord
          )

          let disclosedPayload = attributes
          if (verifiableCredential.claimFormat === ClaimFormat.SdJwtDc) {
            disclosedPayload = filterAndMapSdJwtKeys(verifiableCredential.disclosedPayload).visibleProperties
          } else if (verifiableCredential.claimFormat === ClaimFormat.MsoMdoc) {
            disclosedPayload = Object.fromEntries(
              Object.values(verifiableCredential.disclosedPayload).flatMap((entry) => Object.entries(entry))
            )
          }

          return {
            id: verifiableCredential.credentialRecord.id,
            credentialName: display.name,
            issuerName: display.issuer.name,
            requestedAttributes: [...Object.keys(disclosedPayload)],
            metadata,
            backgroundColor: display.backgroundColor,
            textColor: display.textColor,
            backgroundImage: display.backgroundImage,
            claimFormat,
          }
        }),
      }
    })
  })

  return {
    areAllSatisfied: entries.every((entry) => entry.isSatisfied),
    name: credentialsForRequest.name ?? 'Unknown',
    purpose: credentialsForRequest.purpose,
    entries,
  }
}

export function formatOpenIdProofRequest(record: OpenId4VPRequestRecord): FormattedSubmission | undefined {
  if (record.presentationExchange) {
    return formatDifPexCredentialsForRequest(record.presentationExchange.credentialsForRequest)
  }

  if (record.dcql) {
    return formatDcqlCredentialsForRequest(record.dcql.queryResult)
  }

  return undefined
}
