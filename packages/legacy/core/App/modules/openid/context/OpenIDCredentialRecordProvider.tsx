import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

import {
  ClaimFormat,
  SdJwtVcRecord,
  SdJwtVcRepository,
  W3cCredentialRecord,
  W3cCredentialRepository,
} from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { recordsAddedByType, recordsRemovedByType } from '@credo-ts/react-hooks/build/recordUtils'
import { TOKENS, useServices } from '../../../container-api'
import { getCredentialForDisplay } from '../display'
import { BrandingOverlayType, CredentialOverlay, OCABundleResolveAllParams } from '@hyperledger/aries-oca/build/legacy'
import { buildFieldsFromW3cCredsCredential } from '../../../utils/oca'
import { useTranslation } from 'react-i18next'
import { BrandingOverlay } from '@hyperledger/aries-oca'

type OpenIDCredentialRecord = W3cCredentialRecord | SdJwtVcRecord | undefined

export type OpenIDCredentialContext = {
  openIdState: OpenIDCredentialRecordState
  getCredentialById: (id: string) => Promise<W3cCredentialRecord | SdJwtVcRecord | undefined>
  storeCredential: (cred: W3cCredentialRecord | SdJwtVcRecord) => Promise<void>
  removeCredential: (cred: W3cCredentialRecord | SdJwtVcRecord) => Promise<void>
  resolveBundleForCredential: (
    credential: SdJwtVcRecord | W3cCredentialRecord
  ) => Promise<CredentialOverlay<BrandingOverlay>>
}

export type OpenIDCredentialRecordState = {
  openIDCredentialRecords: Array<OpenIDCredentialRecord>
  w3cCredentialRecords: Array<W3cCredentialRecord>
  sdJwtVcRecords: Array<SdJwtVcRecord>
  isLoading: boolean
}

const addRecord = (record: W3cCredentialRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.w3cCredentialRecords]
  newRecordsState.unshift(record)

  return {
    ...state,
    w3cCredentialRecords: newRecordsState,
  }
}

const removeRecord = (record: W3cCredentialRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.w3cCredentialRecords]
  const index = newRecordsState.findIndex((r) => r.id === record.id)
  if (index > -1) {
    newRecordsState.splice(index, 1)
  }

  return {
    ...state,
    w3cCredentialRecords: newRecordsState,
  }
}

const defaultState: OpenIDCredentialRecordState = {
  openIDCredentialRecords: [],
  w3cCredentialRecords: [],
  sdJwtVcRecords: [],
  isLoading: true,
}

interface OpenIDCredentialProviderProps {
  children: React.ReactNode
}

const OpenIDCredentialRecordContext = createContext<OpenIDCredentialContext>(null as unknown as OpenIDCredentialContext)

const isW3CCredentialRecord = (record: W3cCredentialRecord) => {
  return record.getTags()?.claimFormat === ClaimFormat.JwtVc
}

const filterW3CCredentialsOnly = (credentials: W3cCredentialRecord[]) => {
  return credentials.filter((r) => isW3CCredentialRecord(r))
}

// eslint-disable-next-line react/prop-types
export const OpenIDCredentialRecordProvider: React.FC<PropsWithChildren<OpenIDCredentialProviderProps>> = ({
  children,
}: OpenIDCredentialProviderProps) => {
  const [state, setState] = useState<OpenIDCredentialRecordState>(defaultState)

  const { agent } = useAgent()
  const [logger, bundleResolver] = useServices([TOKENS.UTIL_LOGGER, TOKENS.UTIL_OCA_RESOLVER])
  const { i18n } = useTranslation()

  function checkAgent() {
    if (!agent) {
      const error = 'Agent undefined!'
      logger.error(`[OpenIDCredentialRecordProvider] ${error}`)
      throw new Error(error)
    }
  }

  async function getCredentialById(id: string): Promise<W3cCredentialRecord | SdJwtVcRecord | undefined> {
    checkAgent()
    return await agent?.w3cCredentials.getCredentialRecordById(id)
  }

  async function storeCredential(cred: W3cCredentialRecord | SdJwtVcRecord): Promise<void> {
    checkAgent()
    if (cred instanceof W3cCredentialRecord) {
      await agent?.dependencyManager.resolve(W3cCredentialRepository).save(agent.context, cred)
    } else {
      await agent?.dependencyManager.resolve(SdJwtVcRepository).save(agent.context, cred)
    }
  }

  async function deleteCredential(cred: W3cCredentialRecord | SdJwtVcRecord) {
    checkAgent()
    if (cred instanceof W3cCredentialRecord) {
      await agent?.w3cCredentials.removeCredentialRecord(cred.id)
    } else if (cred instanceof SdJwtVcRecord) {
      await agent?.sdJwtVc.deleteById(cred.id)
    }
  }

  const resolveBundleForCredential = async (
    credential: SdJwtVcRecord | W3cCredentialRecord
  ): Promise<CredentialOverlay<BrandingOverlay>> => {
    const credentialDisplay = getCredentialForDisplay(credential)

    const params: OCABundleResolveAllParams = {
      identifiers: {
        schemaId: '',
        credentialDefinitionId: credentialDisplay.id,
      },
      meta: {
        alias: credentialDisplay.display.issuer.name,
        credConnectionId: undefined,
        credName: credentialDisplay.display.name,
      },
      attributes: buildFieldsFromW3cCredsCredential(credentialDisplay),
      language: i18n.language,
    }

    const bundle = await bundleResolver.resolveAllBundles(params)
    const _bundle = bundle as CredentialOverlay<BrandingOverlay>

    const brandingOverlay: BrandingOverlay = new BrandingOverlay('none', {
      capture_base: 'none',
      type: BrandingOverlayType.Branding10,
      primary_background_color: credentialDisplay.display.backgroundColor,
      background_image: credentialDisplay.display.backgroundImage?.url,
      logo: credentialDisplay.display.logo?.url,
    })
    const ocaBundle: CredentialOverlay<BrandingOverlay> = {
      ..._bundle,
      presentationFields: bundle.presentationFields,
      brandingOverlay: brandingOverlay,
    }

    return ocaBundle
  }

  useEffect(() => {
    if (!agent) {
      return
    }
    agent.w3cCredentials?.getAllCredentialRecords().then((w3cCredentialRecords) => {
      setState((prev) => ({
        ...prev,
        w3cCredentialRecords: filterW3CCredentialsOnly(w3cCredentialRecords),
        isLoading: false,
      }))
    })
  }, [agent])

  useEffect(() => {
    if (!state.isLoading && agent) {
      const credentialAdded$ = recordsAddedByType(agent, W3cCredentialRecord).subscribe((record) => {
        //This handler will return ANY creds added to the wallet even DidComm
        //Sounds like a bug in the hooks package
        //This check will safe guard the flow untill a fix goes to the hooks
        if (isW3CCredentialRecord(record)) {
          setState(addRecord(record, state))
        }
      })

      const credentialRemoved$ = recordsRemovedByType(agent, W3cCredentialRecord).subscribe((record) => {
        setState(removeRecord(record, state))
      })

      return () => {
        credentialAdded$.unsubscribe()
        credentialRemoved$.unsubscribe()
      }
    }
  }, [state, agent])

  return (
    <OpenIDCredentialRecordContext.Provider
      value={{
        openIdState: state,
        storeCredential: storeCredential,
        removeCredential: deleteCredential,
        getCredentialById: getCredentialById,
        resolveBundleForCredential: resolveBundleForCredential,
      }}
    >
      {children}
    </OpenIDCredentialRecordContext.Provider>
  )
}

export const useOpenIDCredentials = () => useContext(OpenIDCredentialRecordContext)
