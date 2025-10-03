import { DidCommCredentialPreviewAttribute, DidCommCredentialPreviewAttributeOptions } from '@credo-ts/didcomm'

import { IOverlayBundleAttribute as OverlayBundleAttributeOptions } from '../../interfaces/overlay'

export default class DisplayAttribute extends DidCommCredentialPreviewAttribute {
  characterEncoding: string | undefined
  standard: string | undefined
  format: string | undefined
  information: string | undefined
  label: string | undefined

  constructor(
    options: DidCommCredentialPreviewAttributeOptions,
    overlayOptions: OverlayBundleAttributeOptions,
    language: string
  ) {
    super(options)

    this.characterEncoding = overlayOptions.characterEncoding
    this.standard = overlayOptions.standard
    this.format = overlayOptions.format
    this.information = overlayOptions.information?.[language]
    this.label = overlayOptions.label?.[language]
  }

  toJSON(): Record<string, unknown> {
    return { ...super.toJSON(), format: this.format, information: this.information, label: this.label }
  }
}
