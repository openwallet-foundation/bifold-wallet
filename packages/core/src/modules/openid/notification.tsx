import { OpenId4VciNotificationMetadata, OpenId4VciRequestTokenResponse } from '@credo-ts/openid4vc'
import { useAgent } from '@bifold/react-hooks'
import { useServices, TOKENS } from '../../container-api'

export enum NotificationEventType {
  CREDENTIAL_ACCEPTED = 'credential_accepted',
  CREDENTIAL_DELETED = 'credential_deleted',
  CREDENTIAL_FAILURE = 'credential_failure',
}

//TODO: ADD TYPE SAFETY
interface sendOpenId4VciNotificationOptions {
  notificationMetadata: OpenId4VciNotificationMetadata
  accessToken: OpenId4VciRequestTokenResponse['accessToken']
  notificationEvent: NotificationEventType
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
      notificationMetadata: options?.notificationMetadata,
      accessToken: options?.accessToken,
      notificationEvent: options?.notificationEvent,
    })
  }
  return {
    sendOpenId4VciNotification,
  }
}
