import { IndyRevocationInterval, PredicateType } from '@aries-framework/core'

export interface IndyRequestedPredicate {
  label?: string
  name: string
  predicateType: PredicateType
  predicateValue: number
  restrictions?: Array<Record<string, string>>
  nonRevoked?: IndyRevocationInterval
  parameterizable?: boolean
}

export interface IndyRequestedAttribute {
  label?: string
  name?: string
  names?: Array<string>
  restrictions?: Array<Record<string, string>>
  revealed?: boolean
  nonRevoked?: IndyRevocationInterval
}

export interface IndyProofRequestTemplatePayloadData {
  schema: string
  requestedAttributes?: Array<IndyRequestedAttribute>
  requestedPredicates?: Array<IndyRequestedPredicate>
}

export enum ProofRequestType {
  Indy = 'indy',
  DIF = 'dif',
}

export interface IndyProofRequestTemplatePayload {
  type: ProofRequestType.Indy
  data: Array<IndyProofRequestTemplatePayloadData>
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DifProofRequestTemplatePayloadData {}

export interface DifProofRequestTemplatePayload {
  type: ProofRequestType.DIF
  data: Array<DifProofRequestTemplatePayloadData>
}

export interface ProofRequestTemplate {
  id: string
  name: string
  description: string
  version: string
  payload: IndyProofRequestTemplatePayload | DifProofRequestTemplatePayload
}
