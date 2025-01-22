import { AnonCredsCredentialsForProofRequest } from '@credo-ts/anoncreds'
import { CredentialExchangeRecord } from '@credo-ts/core'
import { Attribute, Predicate } from '@hyperledger/aries-oca/build/legacy'
import { DescriptorMetadata } from '../utils/anonCredsProofRequestMapper'

export type CredentialDataForProof = {
  groupedProof: (ProofCredentialPredicates & ProofCredentialAttributes)[],
  retrievedCredentials: AnonCredsCredentialsForProofRequest | undefined
  fullCredentials: CredentialExchangeRecord[]
  descriptorMetadata?: DescriptorMetadata
}
export interface ProofCredentialAttributes {
  altCredentials?: string[]
  credExchangeRecord?: CredentialExchangeRecord
  credId: string
  credDefId?: string
  schemaId?: string
  credName: string
  attributes?: Attribute[]
}

export interface ProofCredentialPredicates {
  altCredentials?: string[]
  credExchangeRecord?: CredentialExchangeRecord
  credId: string
  credDefId?: string
  schemaId?: string
  credName: string
  predicates?: Predicate[]
}

export interface ProofCredentialItems extends ProofCredentialAttributes, ProofCredentialPredicates { }
