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

type OpenIDCredentialRecord = W3cCredentialRecord | SdJwtVcRecord | undefined

export type OpenIDCredentialContext = {
  openIdState: OpenIDCredentialRecordState
  storeCredential: (cred: W3cCredentialRecord | SdJwtVcRecord) => Promise<void>
  removeCredential: (cred: W3cCredentialRecord | SdJwtVcRecord) => Promise<void>
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
  const [logger] = useServices([TOKENS.UTIL_LOGGER])

  function checkAgent() {
    if (!agent) {
      const error = 'Agent undefined!'
      logger.error(`[OpenIDCredentialRecordProvider] ${error}`)
      throw new Error(error)
    }
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
      }}
    >
      {children}
    </OpenIDCredentialRecordContext.Provider>
  )
}

export const useOpenIDCredentials = () => useContext(OpenIDCredentialRecordContext)
