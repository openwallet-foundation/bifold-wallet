export class QrCodeScanError extends Error {
  public data?: string
  public constructor(message?: string, data?: string) {
    super(message)
    this.data = data
  }
}
