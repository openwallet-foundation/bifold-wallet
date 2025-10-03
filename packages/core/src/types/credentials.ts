import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { DidCommCredentialExchangeRecord } from '@credo-ts/didcomm'

export type GenericCredentialExchangeRecord =
  | DidCommCredentialExchangeRecord
  | W3cCredentialRecord
  | SdJwtVcRecord
  | MdocRecord
