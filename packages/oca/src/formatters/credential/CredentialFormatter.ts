import { CredentialExchangeRecord } from '@credo-ts/core'

import { OverlayBundle } from '../../types'

import LocalizedCredential from './LocalizedCredential'

export default class CredentialFormatter {
  #credentials!: Record<string, LocalizedCredential>

  constructor(bundle: OverlayBundle, record: CredentialExchangeRecord) {
    this.#credentials = bundle.languages.reduce((credentials, language) => {
      credentials[language] = new LocalizedCredential(bundle, record, language)
      return credentials
    }, {} as Record<string, LocalizedCredential>)
  }

  localizedCredential(language: string): LocalizedCredential | undefined {
    return this.#credentials[language]
  }
}
