import { AnonCredsCredentialsForProofRequest } from '@credo-ts/anoncreds'
import { DidCommCredentialExchangeRecord } from '@credo-ts/didcomm'
import { Attribute, Predicate } from '@bifold/oca/build/legacy'
import { DescriptorMetadata } from '../utils/anonCredsProofRequestMapper'

export type CredentialDataForProof = {
  groupedProof: (ProofCredentialPredicates & ProofCredentialAttributes)[]
  retrievedCredentials: AnonCredsCredentialsForProofRequest | undefined
  fullCredentials: DidCommCredentialExchangeRecord[]
  descriptorMetadata?: DescriptorMetadata
}
export interface ProofCredentialAttributes {
  altCredentials?: string[]
  credExchangeRecord?: DidCommCredentialExchangeRecord
  credId: string
  credDefId?: string
  schemaId?: string
  credName: string
  attributes?: Attribute[]
}

export interface ProofCredentialPredicates {
  altCredentials?: string[]
  credExchangeRecord?: DidCommCredentialExchangeRecord
  credId: string
  credDefId?: string
  schemaId?: string
  credName: string
  predicates?: Predicate[]
}

export interface ProofCredentialItems extends ProofCredentialAttributes, ProofCredentialPredicates {}
