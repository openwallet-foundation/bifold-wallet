import { OutOfBandRecord } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { useState } from 'react'

export const useOutOfBandByReceivedInvitationId = (receivedInvitationId: string): OutOfBandRecord | undefined => {
  const { agent } = useAgent()
  const [oob, setOob] = useState<OutOfBandRecord | undefined>(undefined)
  if (!oob) {
    agent?.oob.findByReceivedInvitationId(receivedInvitationId).then((res) => {
      if (res) {
        setOob(res)
      }
    })
  }
  return oob
}
