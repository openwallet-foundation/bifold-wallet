import { CredentialExchangeRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'

export type GenericCredentialExchangeRecord = CredentialExchangeRecord | W3cCredentialRecord | SdJwtVcRecord
