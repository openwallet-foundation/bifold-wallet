import { DidCommOutOfBandRecord } from '@credo-ts/didcomm'
import { useEffect, useState } from 'react'
import { useAppAgent } from '../utils/agent'

export const useOutOfBandByReceivedInvitationId = (receivedInvitationId: string): DidCommOutOfBandRecord | undefined => {
  const { agent } = useAppAgent()

  const [oob, setOob] = useState<DidCommOutOfBandRecord | undefined>(undefined)

  useEffect(() => {
    let isMounted = true
    if (oob) return

    const oobApi = agent?.modules?.didcomm?.oob
    if (!oobApi?.findByReceivedInvitationId || !receivedInvitationId) return

    oobApi.findByReceivedInvitationId(receivedInvitationId).then((res) => {
      if (isMounted && res) {
        setOob(res)
      }
    })

    return () => {
      isMounted = false
    }
  }, [agent, receivedInvitationId, oob])

  return oob
}
