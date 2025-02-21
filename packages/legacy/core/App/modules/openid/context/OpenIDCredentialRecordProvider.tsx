import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

import {
  ClaimFormat,
  MdocRecord,
  MdocRepository,
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
import { OpenIDCredentialType } from '../types'

type OpenIDCredentialRecord = W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined

export type OpenIDCredentialContext = {
  openIdState: OpenIDCredentialRecordState
  getW3CCredentialById: (id: string) => Promise<W3cCredentialRecord | undefined>
  getSdJwtCredentialById: (id: string) => Promise<SdJwtVcRecord | undefined>
  getMdocCredentialById: (id: string) => Promise<MdocRecord | undefined>
  storeCredential: (cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord) => Promise<void>
  removeCredential: (
    cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord,
    type: OpenIDCredentialType
  ) => Promise<void>
  resolveBundleForCredential: (
    credential: SdJwtVcRecord | W3cCredentialRecord | MdocRecord
  ) => Promise<CredentialOverlay<BrandingOverlay>>
}

export type OpenIDCredentialRecordState = {
  openIDCredentialRecords: Array<OpenIDCredentialRecord>
  w3cCredentialRecords: Array<W3cCredentialRecord>
  sdJwtVcRecords: Array<SdJwtVcRecord>
  mdocVcRecords: Array<MdocRecord>
  isLoading: boolean
}

const addW3cRecord = (record: W3cCredentialRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.w3cCredentialRecords]
  newRecordsState.unshift(record)

  return {
    ...state,
    w3cCredentialRecords: newRecordsState,
  }
}

const removeW3cRecord = (
  record: W3cCredentialRecord,
  state: OpenIDCredentialRecordState
): OpenIDCredentialRecordState => {
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

const addSdJwtRecord = (record: SdJwtVcRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.sdJwtVcRecords]
  newRecordsState.unshift(record)

  return {
    ...state,
    sdJwtVcRecords: newRecordsState,
  }
}

const removeSdJwtRecord = (record: SdJwtVcRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.sdJwtVcRecords]
  const index = newRecordsState.findIndex((r) => r.id === record.id)
  if (index > -1) {
    newRecordsState.splice(index, 1)
  }

  return {
    ...state,
    sdJwtVcRecords: newRecordsState,
  }
}

const defaultState: OpenIDCredentialRecordState = {
  openIDCredentialRecords: [],
  w3cCredentialRecords: [],
  sdJwtVcRecords: [],
  mdocVcRecords: [],
  isLoading: true,
}

interface OpenIDCredentialProviderProps {
  children: React.ReactNode
}

const OpenIDCredentialRecordContext = createContext<OpenIDCredentialContext>(null as unknown as OpenIDCredentialContext)

const isW3CCredentialRecord = (record: W3cCredentialRecord) => {
  return record.getTags()?.claimFormat === ClaimFormat.JwtVc
}

const isSdJwtCredentialRecord = (record: SdJwtVcRecord) => {
  return 'compactSdJwtVc' in record
}

const filterW3CCredentialsOnly = (credentials: W3cCredentialRecord[]) => {
  return credentials.filter((r) => isW3CCredentialRecord(r))
}

const filterSdJwtCredentialsOnly = (credentials: SdJwtVcRecord[]) => {
  return credentials.filter((r) => isSdJwtCredentialRecord(r))
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

  async function getW3CCredentialById(id: string): Promise<W3cCredentialRecord | undefined> {
    checkAgent()
    return await agent?.w3cCredentials.getCredentialRecordById(id)
  }

  async function getSdJwtCredentialById(id: string): Promise<SdJwtVcRecord | undefined> {
    checkAgent()
    return await agent?.sdJwtVc.getById(id)
  }

  async function getMdocCredentialById(id: string): Promise<MdocRecord | undefined> {
    checkAgent()
    return await agent?.mdoc.getById(id)
  }

  async function storeCredential(cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord): Promise<void> {
    checkAgent()
    if (cred instanceof W3cCredentialRecord) {
      await agent?.dependencyManager.resolve(W3cCredentialRepository).save(agent.context, cred)
    } else if (cred instanceof SdJwtVcRecord) {
      await agent?.dependencyManager.resolve(SdJwtVcRepository).save(agent.context, cred)
    } else if (cred instanceof MdocRecord) {
      await agent?.dependencyManager.resolve(MdocRepository).save(agent.context, cred)
    }
  }

  async function deleteCredential(cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord, type: OpenIDCredentialType) {
    checkAgent()
    if (type === OpenIDCredentialType.W3cCredential) {
      await agent?.w3cCredentials.removeCredentialRecord(cred.id)
    } else if (type === OpenIDCredentialType.SdJwtVc) {
      await agent?.sdJwtVc.deleteById(cred.id)
    } else if (type === OpenIDCredentialType.Mdoc) {
      await agent?.mdoc.deleteById(cred.id)
    }
  }

  const resolveBundleForCredential = async (
    credential: SdJwtVcRecord | W3cCredentialRecord | MdocRecord
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

    agent.sdJwtVc?.getAll().then((creds) => {
      setState((prev) => ({
        ...prev,
        sdJwtVcRecords: filterSdJwtCredentialsOnly(creds),
        isLoading: false,
      }))
    })
  }, [agent])

  useEffect(() => {
    if (!state.isLoading && agent) {
      const w3c_credentialAdded$ = recordsAddedByType(agent, W3cCredentialRecord).subscribe((record) => {
        //This handler will return ANY creds added to the wallet even DidComm
        //Sounds like a bug in the hooks package
        //This check will safe guard the flow untill a fix goes to the hooks
        if (isW3CCredentialRecord(record)) {
          setState(addW3cRecord(record, state))
        }
      })

      const w3c_credentialRemoved$ = recordsRemovedByType(agent, W3cCredentialRecord).subscribe((record) => {
        setState(removeW3cRecord(record, state))
      })

      const sdjwt_credentialAdded$ = recordsAddedByType(agent, SdJwtVcRecord).subscribe((record) => {
        //This handler will return ANY creds added to the wallet even DidComm
        //Sounds like a bug in the hooks package
        //This check will safe guard the flow untill a fix goes to the hooks
        setState(addSdJwtRecord(record, state))
        // if (isW3CCredentialRecord(record)) {
        //   setState(addW3cRecord(record, state))
        // }
      })

      const sdjwt_credentialRemoved$ = recordsRemovedByType(agent, SdJwtVcRecord).subscribe((record) => {
        setState(removeSdJwtRecord(record, state))
      })

      return () => {
        w3c_credentialAdded$.unsubscribe()
        w3c_credentialRemoved$.unsubscribe()
        sdjwt_credentialAdded$.unsubscribe()
        sdjwt_credentialRemoved$.unsubscribe()
      }
    }
  }, [state, agent])

  return (
    <OpenIDCredentialRecordContext.Provider
      value={{
        openIdState: state,
        storeCredential: storeCredential,
        removeCredential: deleteCredential,
        getW3CCredentialById: getW3CCredentialById,
        getSdJwtCredentialById: getSdJwtCredentialById,
        getMdocCredentialById: getMdocCredentialById,
        resolveBundleForCredential: resolveBundleForCredential,
      }}
    >
      {children}
    </OpenIDCredentialRecordContext.Provider>
  )
}

export const useOpenIDCredentials = () => useContext(OpenIDCredentialRecordContext)
