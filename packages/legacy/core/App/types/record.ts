export interface Field {
  name: string | null
  format?: string
  type?: string
  encoding?: string
  mimeType?: string
  revoked?: boolean
  credentialId?: string
  label?: string
}

export interface Attribute extends Field {
  value: string | number | null
}

export interface Predicate extends Field {
  pValue: string | number | null
  pType: string
}
