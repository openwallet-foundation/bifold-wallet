import { AnonCredsProof } from '@aries-framework/anoncreds'
type AnonCredsProofIdentifier = AnonCredsProof['identifiers'][number]

export interface MissingAttribute {
  name: string
}

export interface SharedAttribute {
  name: string
  value: string
  identifiers: AnonCredsProofIdentifier
}

export interface SharedGroupedAttribute {
  name: string
  value: string
}

export interface SharedAttributesGroup {
  attributes: Array<SharedGroupedAttribute>
  identifiers: AnonCredsProofIdentifier
}

export interface ResolvedPredicate {
  name: string
  predicateType: string
  predicateValue: number
  identifiers: AnonCredsProofIdentifier
}

export interface UnresolvedPredicate {
  name: string
  predicateType: string
  predicateValue: number
}

export class ParsedAnonCredsProof {
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

export type GroupedSharedProofDataItem = { data: CredentialSharedProofData; identifiers: AnonCredsProofIdentifier }
export type GroupedSharedProofData = Map<string, GroupedSharedProofDataItem>
