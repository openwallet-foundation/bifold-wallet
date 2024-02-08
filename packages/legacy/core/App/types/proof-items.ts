import { CredentialExchangeRecord } from '@aries-framework/core'
import { Attribute, Predicate } from '@hyperledger/aries-oca/build/legacy'

export interface ProofCredentialAttributes {
  altCredentials?: string[]
  credExchangeRecord?: CredentialExchangeRecord
  credId: string
  credDefId?: string
  proofCredDefId?: string
  schemaId?: string
  proofSchemaId?: string
  credName: string
  attributes?: Attribute[]
}

export interface ProofCredentialPredicates {
  altCredentials?: string[]
  credExchangeRecord?: CredentialExchangeRecord
  credId: string
  credDefId?: string
  proofCredDefId?: string
  schemaId?: string
  proofSchemaId?: string
  credName: string
  predicates?: Predicate[]
}

export interface ProofCredentialItems extends ProofCredentialAttributes, ProofCredentialPredicates {}
