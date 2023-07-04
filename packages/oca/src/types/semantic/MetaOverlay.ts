import { IMetaOverlayData } from '../../interfaces/data'
import BaseOverlayL10n from '../base/BaseOverlayL10n'

export default class MetaOverlay extends BaseOverlayL10n {
  #credential_help_text: string
  #credential_support_url: string
  #issuer_description: string
  #issuer_url: string
  #watermark: string

  name: string
  description: string
  issuer: string

  constructor(overlay: IMetaOverlayData) {
    super(overlay)
    this.name = overlay.name
    this.description = overlay.description
    this.#credential_help_text = overlay.credential_help_text
    this.#credential_support_url = overlay.credential_support_url
    this.issuer = overlay.issuer
    this.#issuer_description = overlay.issuer_description
    this.#issuer_url = overlay.issuer_url
    this.#watermark = overlay.watermark
  }

  get credentialHelpText(): string {
    return this.#credential_help_text
  }

  get credentialSupportUrl(): string {
    return this.#credential_support_url
  }

  get issuerDescription(): string {
    return this.#issuer_description
  }

  get issuerUrl(): string {
    return this.#issuer_url
  }

  get watermark(): string {
    return this.#watermark
  }
}
