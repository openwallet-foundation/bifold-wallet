import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay, OCABundleResolveAllParams } from '@bifold/oca/build/legacy'
import { Agent, ClaimFormat, MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { recordsAddedByType, recordsRemovedByType } from '@bifold/react-hooks/build/recordUtils'
import { useTranslation } from 'react-i18next'
import { TOKENS, useServices } from '../../../container-api'
import { buildFieldsFromW3cCredsCredential } from '../../../utils/oca'
import { getCredentialForDisplay } from '../display'
import { OpenIDCredentialType } from '../types'
import { useAppAgent } from '../../../utils/agent'
import {
  findOpenIDCredentialById,
  getOpenIDCredentialById,
  OpenIDCredentialRecord,
  storeOpenIDCredential,
  deleteOpenIDCredential,
} from '../credentialRecord'

export type OpenIDCredentialContext = {
  openIdState: OpenIDCredentialRecordState
  getW3CCredentialById: (id: string) => Promise<W3cCredentialRecord | undefined>
  getSdJwtCredentialById: (id: string) => Promise<SdJwtVcRecord | undefined>
  getMdocCredentialById: (id: string) => Promise<MdocRecord | undefined>
  getCredentialById: (id: string, type?: OpenIDCredentialType) => Promise<OpenIDCredentialRecord | undefined>
  storeCredential: (cred: OpenIDCredentialRecord) => Promise<void>
  removeCredential: (cred: OpenIDCredentialRecord, type: OpenIDCredentialType) => Promise<void>
  resolveBundleForCredential: (credential: OpenIDCredentialRecord) => Promise<CredentialOverlay<BrandingOverlay>>
}

export type OpenIDCredentialRecordState = {
  openIDCredentialRecords: Array<OpenIDCredentialRecord | undefined>
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

  const { agent } = useAppAgent()
  const [logger, bundleResolver] = useServices([TOKENS.UTIL_LOGGER, TOKENS.UTIL_OCA_RESOLVER])
  const { i18n } = useTranslation()

  function getAgent(): Agent {
    if (!agent) {
      const error = 'Agent undefined!'
      logger.error(`[OpenIDCredentialRecordProvider] ${error}`)
      throw new Error(error)
    }

    return agent
  }

  async function getW3CCredentialById(id: string): Promise<W3cCredentialRecord | undefined> {
    const agent = getAgent()
    const record = await getOpenIDCredentialById(agent, OpenIDCredentialType.W3cCredential, id)
    return record instanceof W3cCredentialRecord ? record : undefined
  }

  async function getSdJwtCredentialById(id: string): Promise<SdJwtVcRecord | undefined> {
    const agent = getAgent()
    const record = await getOpenIDCredentialById(agent, OpenIDCredentialType.SdJwtVc, id)
    return record instanceof SdJwtVcRecord ? record : undefined
  }

  async function getMdocCredentialById(id: string): Promise<MdocRecord | undefined> {
    const agent = getAgent()
    const record = await getOpenIDCredentialById(agent, OpenIDCredentialType.Mdoc, id)
    return record instanceof MdocRecord ? record : undefined
  }

  async function getCredentialById(
    id: string,
    type?: OpenIDCredentialType
  ): Promise<OpenIDCredentialRecord | undefined> {
    const agent = getAgent()
    if (type !== undefined) {
      return getOpenIDCredentialById(agent, type, id)
    }

    return findOpenIDCredentialById(agent, id)
  }

  async function storeCredential(cred: OpenIDCredentialRecord): Promise<void> {
    const agent = getAgent()
    await storeOpenIDCredential(agent, cred)
  }

  async function deleteCredential(cred: OpenIDCredentialRecord, _type: OpenIDCredentialType) {
    const agent = getAgent()
    await deleteOpenIDCredential(agent, cred)
  }

  const resolveBundleForCredential = async (
    credential: OpenIDCredentialRecord
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
      background_image: credentialDisplay.display.backgroundImage?.uri,
      logo: credentialDisplay.display.logo?.uri,
    })
    const ocaBundle: CredentialOverlay<BrandingOverlay> = {
      ..._bundle,
      presentationFields: bundle.presentationFields,
      brandingOverlay: brandingOverlay,
    }

    return ocaBundle
  }

  useEffect(() => {
    if (!agent) return

    agent.w3cCredentials?.getAll().then((w3cCredentialRecords) => {
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
    if (state.isLoading) return
    if (!agent?.events?.observable) return

    const w3c_credentialAdded$ = recordsAddedByType(agent, W3cCredentialRecord).subscribe((record) => {
      //This handler will return ANY creds added to the wallet even DidComm
      //Sounds like a bug in the hooks package
      //This check will safe guard the flow untill a fix goes to the hooks
      if (!isW3CCredentialRecord(record)) {
        return
      }

      setState((prev) => addW3cRecord(record, prev))
    })

    const w3c_credentialRemoved$ = recordsRemovedByType(agent, W3cCredentialRecord).subscribe((record) => {
      setState((prev) => removeW3cRecord(record, prev))
    })

    const sdjwt_credentialAdded$ = recordsAddedByType(agent, SdJwtVcRecord).subscribe((record) => {
      if (!isSdJwtCredentialRecord(record)) {
        return
      }

      setState((prev) => addSdJwtRecord(record, prev))
    })

    const sdjwt_credentialRemoved$ = recordsRemovedByType(agent, SdJwtVcRecord).subscribe((record) => {
      setState((prev) => removeSdJwtRecord(record, prev))
    })

    return () => {
      w3c_credentialAdded$.unsubscribe()
      w3c_credentialRemoved$.unsubscribe()
      sdjwt_credentialAdded$.unsubscribe()
      sdjwt_credentialRemoved$.unsubscribe()
    }
  }, [state.isLoading, agent])

  return (
    <OpenIDCredentialRecordContext.Provider
      value={{
        openIdState: state,
        getW3CCredentialById,
        getSdJwtCredentialById,
        getMdocCredentialById,
        getCredentialById,
        storeCredential,
        removeCredential: deleteCredential,
        resolveBundleForCredential,
      }}
    >
      {children}
    </OpenIDCredentialRecordContext.Provider>
  )
}

export const useOpenIDCredentials = (): OpenIDCredentialContext => {
  const context = useContext(OpenIDCredentialRecordContext)
  if (context) {
    return context
  }

  throw new Error('useOpenIDCredentials must be used within a OpenIDCredentialRecordProvider')
}
