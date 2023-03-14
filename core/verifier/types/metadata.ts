export enum ProofMetadata {
  customMetadata = 'customMetadata',
}

export interface ProofCustomMetadata {
  details_seen?: boolean
  proof_request_template_id?: string
}
