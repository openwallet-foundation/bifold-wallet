import { DidCommOutOfBandApi, DidCommOutOfBandRecord } from '@credo-ts/didcomm'
import { useAgent } from '@credo-ts/react-hooks'
import { useState } from 'react'

export const useOutOfBandByReceivedInvitationId = (receivedInvitationId: string): DidCommOutOfBandRecord | undefined => {
  const { agent } = useAgent()

  const [oob, setOob] = useState<DidCommOutOfBandRecord | undefined>(undefined)
  if (!oob) {
    (agent?.modules.oob as DidCommOutOfBandApi).findByReceivedInvitationId(receivedInvitationId).then((res) => {
      if (res) {
        setOob(res)
      }
    })
  }
  return oob
}
