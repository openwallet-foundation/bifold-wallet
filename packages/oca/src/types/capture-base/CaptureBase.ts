import { ICaptureBaseData } from '../../interfaces/data'

export default class CaptureBase {
  #flagged_attributes: string[]

  type: string
  classification: string
  attributes: Record<string, string>
  digest: string

  constructor(captureBase: ICaptureBaseData) {
    this.type = captureBase.type
    this.classification = captureBase.classification
    this.attributes = captureBase.attributes
    this.#flagged_attributes = captureBase.flagged_attributes
    this.digest = captureBase.digest ?? ''
  }

  get flaggedAttributes(): string[] {
    return this.#flagged_attributes
  }
}
