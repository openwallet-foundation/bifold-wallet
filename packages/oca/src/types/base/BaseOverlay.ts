import { IBaseOverlayData } from '../../interfaces/data'

export default class BaseOverlay {
  #capture_base: string

  type: string
  digest: string

  constructor(overlay: IBaseOverlayData) {
    this.type = overlay.type
    this.#capture_base = overlay.capture_base
    this.digest = overlay.digest ?? ''
  }

  get captureBase(): string {
    return this.#capture_base
  }
}
