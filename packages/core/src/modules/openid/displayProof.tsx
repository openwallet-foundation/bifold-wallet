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

const formatDcqlClaimPath = (path: Array<string | number | null>): string =>
  path.filter((item) => item !== null).join('.')

const getDcqlRequestedAttributes = (credentialQuery: DcqlQueryResult['credentials'][number]): string[] => {
  if (credentialQuery.format === 'mso_mdoc') {
    return (
      credentialQuery.claims?.map((claim) =>
        'path' in claim ? formatDcqlClaimPath(claim.path) : [claim.namespace, claim.claim_name].join('.')
      ) ?? []
    )
  }

  return credentialQuery.claims?.map((claim) => formatDcqlClaimPath(claim.path)) ?? []
}

const getDcqlCredentialName = (credentialQuery: DcqlQueryResult['credentials'][number]): string => {
  if (credentialQuery.format === 'mso_mdoc') {
    return credentialQuery.meta?.doctype_value ?? credentialQuery.id
  }

  if (
    (credentialQuery.format === 'vc+sd-jwt' && credentialQuery.meta && 'vct_values' in credentialQuery.meta) ||
    credentialQuery.format === 'dc+sd-jwt'
  ) {
    return credentialQuery.meta && 'vct_values' in credentialQuery.meta && credentialQuery.meta.vct_values?.[0]
      ? credentialQuery.meta.vct_values[0].replace('https://', '')
      : credentialQuery.id
  }

  return credentialQuery.id
}

export function formatDcqlCredentialsForRequest(queryResult: DcqlQueryResult): FormattedSubmission {
  const credentialSets: NonNullable<DcqlQueryResult['credential_sets']> = queryResult.credential_sets ?? [
    {
      required: true,
      options: [queryResult.credentials.map((credential) => credential.id)],
      matching_options: queryResult.can_be_satisfied
        ? [queryResult.credentials.map((credential) => credential.id)]
        : undefined,
    },
  ]

  const entries = credentialSets.flatMap((credentialSet) => {
    const credentialIds = credentialSet.matching_options?.[0] ?? credentialSet.options[0]

    return credentialIds.map((credentialId): FormattedSubmissionEntry => {
      const credentialQuery = queryResult.credentials.find((credential) => credential.id === credentialId)

      if (!credentialQuery) {
        throw new Error(`Credential '${credentialId}' not found in dcql query`)
      }

      const match = queryResult.credential_matches[credentialId]
      const validCredentials: DcqlValidCredential[] = match?.success ? Array.from(match.valid_credentials) : []

      if (validCredentials.length === 0) {
        return {
          inputDescriptorId: credentialId,
          name: getDcqlCredentialName(credentialQuery),
          purpose: typeof credentialSet.purpose === 'string' ? credentialSet.purpose : undefined,
          description: undefined,
          isSatisfied: false,
          credentials: [
            {
              id: credentialId,
              credentialName: getDcqlCredentialName(credentialQuery),
              requestedAttributes: getDcqlRequestedAttributes(credentialQuery),
              claimFormat: ClaimFormat.JwtVc,
            },
          ],
        }
      }

      return {
        inputDescriptorId: credentialId,
        name: credentialId,
        purpose: typeof credentialSet.purpose === 'string' ? credentialSet.purpose : undefined,
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
  })

  return {
    areAllSatisfied: entries.every((entry) => entry.isSatisfied),
    name: 'Unknown',
    purpose: credentialSets
      .map((credentialSet) => credentialSet.purpose)
      .find((purpose): purpose is string => typeof purpose === 'string'),
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
