export enum OpenIDCustomNotificationType {
  CredentialReplacementAvailable = 'CredentialRefresh',
  CredentialExpired = 'CredentialExpired',
}

export interface OpenIDNotificationData {
  type?: OpenIDCustomNotificationType
  createdAt?: Date
  onPressAction?: () => void
  onCloseAction?: () => void
  metadata?: {
    oldId?: string,
    replacementId?: string,
  }
}
