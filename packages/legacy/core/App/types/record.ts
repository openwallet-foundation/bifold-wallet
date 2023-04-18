import { IndyRevocationInterval, CredentialExchangeRecord } from '@aries-framework/core'

export interface FieldParams {
  name: string | null
  format?: string
  type?: string
  encoding?: string
  mimeType?: string
  revoked?: boolean
  credentialId?: string
  label?: string
  restrictions?: Array<Record<string, unknown>>
  nonRevoked?: IndyRevocationInterval
}

export interface AttributeParams extends FieldParams {
  value: string | number | null
  revealed?: boolean
}

export interface PredicateParams extends FieldParams {
  pValue: string | number | null
  pType: string
  parameterizable?: boolean
}

export class Field {
  public name: string | null
  public format?: string
  public type?: string
  public encoding?: string
  public mimeType?: string
  public revoked?: boolean
  public credentialId?: string
  public label?: string
  public restrictions?: Array<Record<string, unknown>>
  public nonRevoked?: IndyRevocationInterval

  protected constructor(params: FieldParams) {
    this.name = params.name
    this.format = params.format
    this.type = params.type
    this.encoding = params.encoding
    this.mimeType = params.mimeType
    this.revoked = params.revoked
    this.credentialId = params.credentialId
    this.label = params.label
    this.restrictions = params.restrictions
    this.nonRevoked = params.nonRevoked
  }
}

export class Attribute extends Field {
  public value: string | number | null
  public revealed?: boolean

  public constructor(params: AttributeParams) {
    super(params)
    this.value = params.value
    this.revealed = params.revealed
  }
}

export class Predicate extends Field {
  public pValue: string | number | null
  public pType: string
  public parameterizable?: boolean

  public constructor(params: PredicateParams) {
    super(params)
    this.pValue = params.pValue
    this.pType = params.pType
    this.parameterizable = params.parameterizable
  }
}

export interface ProofCredentialAttributes {
  credExchangeRecord?: CredentialExchangeRecord
  credDefId?: string
  schemaId?: string
  credName: string
  attributes?: Attribute[]
}

export interface ProofCredentialPredicates {
  credExchangeRecord?: CredentialExchangeRecord
  credDefId?: string
  schemaId?: string
  credName: string
  predicates?: Predicate[]
}

export interface ProofCredentialItems extends ProofCredentialAttributes, ProofCredentialPredicates {}
