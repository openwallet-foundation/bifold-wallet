import { ILegacyBrandingOverlayData } from '../../interfaces/data'
import { generateColor } from '../../utils/color'
import BaseOverlay from '../base/BaseOverlay'

export default class LegacyBrandingOverlay extends BaseOverlay {
  #background_color: string
  #image_source?: string
  header?: {
    color?: string
    backgroundColor?: string
    imageSource?: string
    hideIssuer?: boolean
  }
  footer?: {
    color?: string
    backgroundColor?: string
  }

  constructor(credentialDefinitionId: string, overlay: ILegacyBrandingOverlayData) {
    super(overlay)

    this.#background_color = overlay.background_color ?? generateColor(credentialDefinitionId)
    this.#image_source = overlay.image_source
    if (overlay.header) {
      this.header = {
        color: overlay.header?.color,
        backgroundColor: overlay.header?.background_color,
        imageSource: overlay.header?.image_source,
        hideIssuer: overlay.header?.hide_issuer,
      }
    }
    if (overlay.footer) {
      this.footer = {
        color: overlay.footer?.color,
        backgroundColor: overlay.footer?.background_color,
      }
    }
  }

  public get backgroundColor(): string {
    return this.#background_color
  }

  public get imageSource(): string | undefined {
    return this.#image_source
  }
}
