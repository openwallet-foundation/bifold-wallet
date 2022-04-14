import { RequestedAttribute } from '@aries-framework/core'

export interface Attribute {
  name: string | null
  value: RequestedAttribute | string | null
  mimeType?: string
  revoked?: boolean
  credentialId?: string
}
