import { DidCommCredentialExchangeRecord} from '@credo-ts/didcomm'

import { OverlayBundle } from '../../types'

import LocalizedCredential from './LocalizedCredential'

export default class CredentialFormatter {
  #credentials!: Record<string, LocalizedCredential>

  constructor(bundle: OverlayBundle, record: DidCommCredentialExchangeRecord) {
    this.#credentials = bundle.languages.reduce((credentials, language) => {
      credentials[language] = new LocalizedCredential(bundle, record, language)
      return credentials
    }, {} as Record<string, LocalizedCredential>)
  }

  localizedCredential(language: string): LocalizedCredential | undefined {
    return this.#credentials[language]
  }
}
