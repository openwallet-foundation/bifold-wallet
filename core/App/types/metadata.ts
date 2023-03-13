export enum CredentialMetadata {
  customMetadata = 'customMetadata',
}

export interface customMetadata {
  revoked_seen?: boolean
}

export enum ProofMetadata {
  customMetadata = 'customMetadata',
}

export interface ProofCustomMetadata {
  details_seen?: boolean
}
