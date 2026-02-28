import { OpenId4VciRequestTokenResponse, OpenId4VciMetadata } from '@credo-ts/openid4vc'
import { useServices, TOKENS } from '../../container-api'
import { useAppAgent } from '../../utils/agent'

export enum NotificationEventType {
  CREDENTIAL_ACCEPTED = 'credential_accepted',
  CREDENTIAL_DELETED = 'credential_deleted',
  CREDENTIAL_FAILURE = 'credential_failure',
}

//TODO: ADD TYPE SAFETY
interface sendOpenId4VciNotificationOptions {
  notificationId: string
  notificationMetadata: OpenId4VciMetadata
  accessToken: OpenId4VciRequestTokenResponse['accessToken']
  notificationEvent: NotificationEventType
}

export const useOpenId4VciNotifications = () => {
  const { agent } = useAppAgent()
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
    await agent.modules.openid4vc.holder.sendNotification({
      notificationId: options.notificationId,
      metadata: options?.notificationMetadata,
      accessToken: options?.accessToken,
      notificationEvent: options?.notificationEvent,
    })
  }
  return {
    sendOpenId4VciNotification,
  }
}
