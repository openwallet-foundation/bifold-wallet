export class QrCodeScanError extends Error {
  public data?: string
  public constructor(message?: string, data?: string) {
    super(message)
    this.data = data
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
