import startCase from 'lodash.startcase'

import {
  Bundle,
  CardLayoutOverlay10,
  CardLayoutOverlay11,
  CardOverlayType,
  Identifiers,
  Meta,
  MetaOverlay,
  OCABundleResolverOptions,
  OverlayType,
} from '../types'
import { parseCredDefFromId } from '../utils/cred-def'
import { hashCode, hashToRGBA } from '../utils/helpers'

import { OCABundle } from './ocabundle'

export abstract class AbstractOCABundleResolver {
  protected options: OCABundleResolverOptions

  protected constructor(options?: OCABundleResolverOptions) {
    this.options = {
      cardOverlayType: options?.cardOverlayType ?? CardOverlayType.CardLayout11,
      language: options?.language ?? 'en',
    }
  }

  public get cardOverlayType() {
    return this.options.cardOverlayType ?? CardOverlayType.CardLayout11
  }

  protected getDefaultBundle(params: { language?: string; identifiers?: Identifiers; meta?: Meta }) {
    if (!params.language) {
      params.language = 'en'
    }
    const metaOverlay: MetaOverlay = {
      captureBase: '',
      type: OverlayType.Meta10,
      name: startCase(
        params.meta?.credName ??
          parseCredDefFromId(params.identifiers?.credentialDefinitionId, params.identifiers?.schemaId)
      ),
      issuerName: params.meta?.alias || params.meta?.credConnectionId || 'Unknown Contact',
      language: params.language ?? this.options?.language,
    }

    let colorHash = 'default'
    if (metaOverlay?.name) {
      colorHash = metaOverlay.name
    } else if (metaOverlay?.issuerName) {
      colorHash = metaOverlay.issuerName
    }

    const cardLayoutOverlay10: CardLayoutOverlay10 = {
      captureBase: '',
      type: OverlayType.CardLayout10,
      backgroundColor: hashToRGBA(hashCode(colorHash)),
    }

    const cardLayoutOverlay11: CardLayoutOverlay11 = {
      captureBase: '',
      type: OverlayType.CardLayout11,
      primaryBackgroundColor: hashToRGBA(hashCode(colorHash)),
    }

    const bundle: Bundle = {
      captureBase: { captureBase: '', type: OverlayType.Base10 },
      overlays: [
        metaOverlay,
        this.cardOverlayType === CardOverlayType.CardLayout10 ? cardLayoutOverlay10 : cardLayoutOverlay11,
      ],
    }

    return Promise.resolve(
      new OCABundle(bundle, { ...this.options, language: params.language ?? this.options.language })
    )
  }
}
