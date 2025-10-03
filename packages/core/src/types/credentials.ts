import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { DidCommCredentialExchangeRecord } from '@credo-ts/didcomm'

export enum CredentialErrors {
  Revoked, // Credential has been revoked
  NotInWallet, // Credential requested for proof does not exists in users wallet
  PredicateError, // Credential requested for proof contains a predicate match that is not satisfied
}

export type GenericCredentialExchangeRecord =
  | DidCommCredentialExchangeRecord
  | W3cCredentialRecord
  | SdJwtVcRecord
  | MdocRecord
