import { DidCommOutOfBandRecord } from '@credo-ts/didcomm'
import { useState } from 'react'
import { useAppAgent } from '../utils/agent'

export const useOutOfBandByReceivedInvitationId = (receivedInvitationId: string): DidCommOutOfBandRecord | undefined => {
  const { agent } = useAppAgent()

  const [oob, setOob] = useState<DidCommOutOfBandRecord | undefined>(undefined)
  if (!oob) {
    agent?.modules.didcomm.oob.findByReceivedInvitationId(receivedInvitationId).then((res) => {
      if (res) {
        setOob(res)
      }
    })
  }
  return oob
}
