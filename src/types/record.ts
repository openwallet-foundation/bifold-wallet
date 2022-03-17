import { RequestedAttribute } from '@aries-framework/core'

export interface Attribute {
  name: string
  value: RequestedAttribute | string | null
}
