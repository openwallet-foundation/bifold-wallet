import { IBaseOverlayL10nData } from '../../interfaces/data'

import BaseOverlay from './BaseOverlay'

export default class BaseOverlayL10n extends BaseOverlay {
  language: string

  constructor(overlay: IBaseOverlayL10nData) {
    super(overlay)
    this.language = overlay.language
  }
}
