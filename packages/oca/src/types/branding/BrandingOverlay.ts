import { IBrandingOverlayData } from '../../interfaces/data'
import { generateColor } from '../../utils/color'
import BaseOverlay from '../base/BaseOverlay'

export default class BrandingOverlay extends BaseOverlay {
  #background_image?: string
  #background_image_slice?: string
  #primary_background_color: string
  #secondary_background_color?: string
  #primary_attribute?: string
  #secondary_attribute?: string
  #issued_date_attribute?: string
  #expiry_date_attribute?: string

  logo?: string

  constructor(credentialDefinitionId: string, overlay: IBrandingOverlayData) {
    super(overlay)
    this.logo = overlay.logo
    this.#background_image = overlay.background_image
    this.#background_image_slice = overlay.background_image_slice
    this.#primary_background_color = overlay.primary_background_color ?? generateColor(credentialDefinitionId)
    this.#secondary_background_color = overlay.secondary_background_color
    this.#primary_attribute = overlay.primary_attribute
    this.#secondary_attribute = overlay.secondary_attribute
    this.#issued_date_attribute = overlay.issued_date_attribute
    this.#expiry_date_attribute = overlay.expiry_date_attribute
  }

  get backgroundImage(): string | undefined {
    return this.#background_image
  }

  get backgroundImageSlice(): string | undefined {
    return this.#background_image_slice
  }

  get primaryBackgroundColor(): string | undefined {
    return this.#primary_background_color
  }

  get secondaryBackgroundColor(): string | undefined {
    return this.#secondary_background_color
  }

  get primaryAttribute(): string | undefined {
    return this.#primary_attribute
  }

  get secondaryAttribute(): string | undefined {
    return this.#secondary_attribute
  }

  get issuedDateAttribute(): string | undefined {
    return this.#issued_date_attribute
  }

  get expiryDateAttribute(): string | undefined {
    return this.#expiry_date_attribute
  }
}
