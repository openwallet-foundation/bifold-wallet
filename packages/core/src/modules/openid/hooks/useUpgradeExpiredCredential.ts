// modules/openid/hooks/useUpgradeExpiredCredential.ts
import { useCallback } from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useAgent } from '@bifold/react-hooks'

import { RootStackParams, Screens, Stacks } from '../../../types/navigators'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import { TOKENS, useServices } from '../../../container-api'
import { refreshAndQueueReplacement } from '../refresh/operations'

export const useUpgradeExpiredCredential = () => {
  const navigation = useNavigation<NavigationProp<RootStackParams>>()
  const { agent } = useAgent()
  const { getCredentialById } = useOpenIDCredentials()
  const [logger] = useServices([TOKENS.UTIL_LOGGER])

  const upgrade = useCallback(
    async (oldId: string) => {
      if (!agent) {
        logger?.warn('⚠️ [Upgrade] Agent not ready, cannot upgrade credential')
        return
      }

      logger?.info(`🔁 [Upgrade] Starting upgrade flow for oldId=${oldId}`)

      const rec = await getCredentialById(oldId)

      if (!rec) {
        logger?.warn(`⚠️ [Upgrade] No full record found for oldId=${oldId}`)
        return
      }

      const newRecord = await refreshAndQueueReplacement({
        agent,
        logger,
        record: rec,
      })

      if (!newRecord) {
        logger?.warn(`⚠️ [Upgrade] Could not issue replacement for oldId=${oldId}`)
        return
      }

      logger?.info(`💾 [Upgrade] New credential issued ${newRecord.id} from oldId=${oldId}`)

      // Navigate to the OpenID offer screen, passing the new record directly
      navigation.navigate(Stacks.ConnectionStack, {
        screen: Screens.OpenIDCredentialOffer,
        params: {
          credential: newRecord,
        },
      })
    },
    [agent, logger, navigation, getCredentialById]
  )

  return { upgrade }
}
