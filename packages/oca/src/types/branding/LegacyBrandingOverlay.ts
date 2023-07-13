import { ILegacyBrandingOverlayData } from '../../interfaces/data'
import { generateColor } from '../../utils/color'
import BaseOverlay from '../base/BaseOverlay'

export default class LegacyBrandingOverlay extends BaseOverlay {
  backgroundColor: string
  imageSource?: string
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

    this.backgroundColor = overlay.backgroundColor ?? generateColor(credentialDefinitionId)
    this.imageSource = overlay.imageSource
    this.header = overlay.header
    this.footer = overlay.footer
  }
}
