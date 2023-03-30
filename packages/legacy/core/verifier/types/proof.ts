import { ProofIdentifier } from '@aries-framework/core'

export interface MissingAttribute {
  name: string
}

export interface SharedAttribute {
  name: string
  value: string
  identifiers: ProofIdentifier
}

export interface SharedGroupedAttribute {
  name: string
  value: string
}

export interface SharedAttributesGroup {
  attributes: Array<SharedGroupedAttribute>
  identifiers: ProofIdentifier
}

export interface ResolvedPredicate {
  name: string
  predicateType: string
  predicateValue: number
  identifiers: ProofIdentifier
}

export interface UnresolvedPredicate {
  name: string
  predicateType: string
  predicateValue: number
}

export class ParsedIndyProof {
  public sharedAttributes: Array<SharedAttribute>
  public sharedAttributeGroups: Array<SharedAttributesGroup>
  public resolvedPredicates: Array<ResolvedPredicate>
  public unresolvedAttributes: Array<MissingAttribute>
  public unresolvedAttributeGroups: Array<Array<MissingAttribute>>
  public unresolvedPredicates: Array<UnresolvedPredicate>

  public constructor() {
    this.sharedAttributes = []
    this.sharedAttributeGroups = []
    this.resolvedPredicates = []
    this.unresolvedAttributes = []
    this.unresolvedAttributeGroups = []
    this.unresolvedPredicates = []
  }
}

export class CredentialSharedProofData {
  public sharedAttributes: Array<SharedAttribute>
  public sharedAttributeGroups: Array<SharedAttributesGroup>
  public resolvedPredicates: Array<ResolvedPredicate>

  public constructor() {
    this.sharedAttributes = []
    this.sharedAttributeGroups = []
    this.resolvedPredicates = []
  }
}

export type GroupedSharedProofDataItem = { data: CredentialSharedProofData; identifiers: ProofIdentifier }
export type GroupedSharedProofData = Map<string, GroupedSharedProofDataItem>
