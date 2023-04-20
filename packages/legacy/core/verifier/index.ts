export { ProofRequestType } from './types/proof-reqeust-template'
export type {
  ProofRequestTemplate,
  DifProofRequestTemplatePayload,
  DifProofRequestTemplatePayloadData,
  IndyProofRequestTemplatePayload,
  IndyProofRequestTemplatePayloadData,
  IndyRequestedAttribute,
  IndyRequestedPredicate,
} from './types/proof-reqeust-template'
export type {
  GroupedSharedProofData,
  GroupedSharedProofDataItem,
  CredentialSharedProofData,
  ParsedIndyProof,
  UnresolvedPredicate,
  ResolvedPredicate,
  SharedAttributesGroup,
  SharedGroupedAttribute,
  SharedAttribute,
  MissingAttribute,
} from './types/proof'
export type { ProofCustomMetadata } from './types/metadata'
export { ProofMetadata } from './types/metadata'
export { useProofsByTemplateId } from './hooks/proofs'
export {
  getProofIdentifiers,
  parseIndyProof,
  groupSharedProofDataByCredential,
  getProofData,
  isPresentationReceived,
  isPresentationFailed,
  markProofAsViewed,
  linkProofWithTemplate,
} from './utils/proof'
export type { CreateProofRequestInvitationResult, SendProofRequestResult } from './utils/proof-request'
export {
  findProofRequestMessage,
  buildProofRequestDataForTemplate,
  createConnectionlessProofRequestInvitation,
  sendProofRequest,
  hasPredicates,
  isParameterizable,
} from './utils/proof-request'
export { defaultProofRequestTemplates } from './request-templates'
