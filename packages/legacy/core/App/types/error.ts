import { ViewStyle } from 'react-native'

export class QrCodeScanError extends Error {
  public data?: string
  public details?: string
  public constructor(message?: string, data?: string, details?: string) {
    super(message)
    this.data = data
    this.details = details
  }
}

export class BifoldError extends Error {
  public title: string
  public code: number
  public description: string

  public constructor(title: string, description: string, message: string, code: number) {
    super(message)

    this.title = title
    this.description = description
    this.code = code

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BifoldError.prototype)
  }
}

export type InlineErrorConfig = {
  enabled: boolean
  position?: InlineErrorPosition
  style?: ViewStyle
}

export enum InlineErrorPosition {
  Above,
  Below,
}
