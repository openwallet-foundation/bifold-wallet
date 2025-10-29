import {
  OpenId4VciRequestTokenResponse,
  OpenId4VciIssuerMetadata,
} from '@credo-ts/openid4vc'
import { SdJwtVcRecord, W3cCredentialRecord, MdocRecord, Agent } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { useServices, TOKENS } from '../../container-api'

export enum NotificationEventType {
  CREDENTIAL_ACCEPTED = 'credential_accepted',
  CREDENTIAL_DELETED = 'credential_deleted',
  CREDENTIAL_FAILURE = 'credential_failure',
}

//TODO: ADD TYPE SAFETY
interface sendOpenId4VciNotificationOptions {
  metadata: any
  notificationId: string
  accessToken: OpenId4VciRequestTokenResponse["accessToken"]
  notificationEvent: NotificationEventType
  dpop?: OpenId4VciRequestTokenResponse["dpop"]
}

export const useOpenId4VciNotifications = () => {
  
  const { agent } = useAgent()
  const [logger] = useServices([TOKENS.UTIL_LOGGER, TOKENS.UTIL_OCA_RESOLVER])

  /**
   * Sends notification to issuer with credential status.
   * @param options
  */
  const sendOpenId4VciNotification = async (options: sendOpenId4VciNotificationOptions) => {
    if (!agent) {
      const error = 'Agent undefined!'
      logger.error(`[OpenIDCredentialNotification] ${error}`)
      throw new Error(error)
    }
    await agent.modules.openId4VcHolder.sendNotification({
      metadata: options?.metadata,
      notificationId: options?.notificationId,
      accessToken: options?.accessToken,
      notificationEvent: options?.notificationEvent,
      dpop: options?.dpop,
    })
  }
  return {
    sendOpenId4VciNotification,
  }
}

/**
 * Sends notification to issuer with credential status.
 * @param agent
 * @param options
 */
export const sendOpenId4VciNotificationFunction = async (agent: Agent, { metadata, notificationId, accessToken, notificationEvent, dpop }: sendOpenId4VciNotificationOptions) => {
  try {
    
    if (!agent) throw new Error('Agent undefined!')

    await agent.modules.openId4VcHolder.sendNotification({
      metadata,
      notificationId,
      accessToken,
      notificationEvent,
      dpop,
    })

  } catch (err) {
    console.error(err)
  }
}
