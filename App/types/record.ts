import { RequestedAttribute } from '@aries-framework/core'

export interface Attribute {
  name: string | null
  value: RequestedAttribute | string | null
  revoked: boolean
}
