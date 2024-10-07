import { ClaimFormat, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { recordsAddedByType } from '@credo-ts/react-hooks/build/recordUtils'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

type OpenIDCredentialRecord = W3cCredentialRecord | SdJwtVcRecord | undefined

export type OpenIDCredentialRecordState = {
  openIDCredentialRecords: Array<OpenIDCredentialRecord>
  w3cCredentialRecords: Array<W3cCredentialRecord>
  sdJwtVcRecords: Array<SdJwtVcRecord>
  isLoading: boolean
}

const addRecord = (record: W3cCredentialRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.w3cCredentialRecords]
  newRecordsState.unshift(record)
  console.log('$$addRecord: -->', newRecordsState.length)
  console.log('##addRecord: -->', JSON.stringify(record))

  return {
    ...state,
    w3cCredentialRecords: newRecordsState,
  }
}
const defaultSate: OpenIDCredentialRecordState = {
  openIDCredentialRecords: [],
  w3cCredentialRecords: [],
  sdJwtVcRecords: [],
  isLoading: true,
}

interface Props {
  children: React.ReactNode
}

const OpenIDCredentialRecordContext = createContext<OpenIDCredentialRecordState>(defaultSate)

const isW3CCredentialRecord = (record: W3cCredentialRecord) => {
  return record.getTags()?.claimFormat === ClaimFormat.JwtVc
}

const filterW3CCredentialsOnly = (credentials: W3cCredentialRecord[]) => {
  return credentials.filter((r) => isW3CCredentialRecord(r))
}

// eslint-disable-next-line react/prop-types
export const OpenIDCredentialRecordProvider: React.FC<PropsWithChildren<Props>> = ({ children }) => {
  const [state, setState] = useState<OpenIDCredentialRecordState>(defaultSate)

  const { agent } = useAgent()

  useEffect(() => {
    if (!agent) {
      return
    }
    agent.w3cCredentials.getAllCredentialRecords().then((w3cCredentialRecords) => {
      setState({ ...state, w3cCredentialRecords: filterW3CCredentialsOnly(w3cCredentialRecords), isLoading: false })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      return () => {
        credentialAdded$.unsubscribe()
      }
    }
  }, [state, agent])

  return <OpenIDCredentialRecordContext.Provider value={state}>{children}</OpenIDCredentialRecordContext.Provider>
}

export const useOpenIDCredentials = () => useContext(OpenIDCredentialRecordContext)
