export enum HistoryCardType {
  CardAccepted = 'CardAccepted',
  CardDeclined = 'CardDeclined',
  CardExpired = 'CardExpired',
  CardRevoked = 'CardRevoked',
  InformationSent = 'InformationSent',
  PinChanged = 'PinChanged',
  CardUpdates = 'CardUpdates',
}
export interface HistoryRecord {
  /** History Record ID */
  id?: string
  /** History Record Type */
  type?: HistoryCardType
  /** History Record Message */
  message: string
  /** History Record Date */
  createdAt?: Date
  /** History Record Item ID */
  correspondenceId?: string
  /** History Record Item Name */
  correspondenceName?: string
}
export enum RecordType {
  AppNotificationRecord = 'AppNotificationRecord',
  NotificationRecord = 'NotificationRecord',
  HistoryRecord = 'HistoryRecord',
}
export type TagObject = {
  [key: string]: string | boolean | undefined | Array<string> | null
  [key: number]: never
}

export interface CustomRecord {
  content: RecordTypes
  tags?: TagObject
}

export interface AppNotificationRecord {
  id?: string
  createdAt?: Date
  type?: AppNotificationCardType
}

export interface NotificationRecord {
  message: string
  credentialId: string
  type?: NotificationCardType
  id?: string
  createdAt?: Date
  isNotificationRemoved: boolean
}

export enum AppNotificationCardType {
  AppPinReminder = 'AppPinReminder',
}

export enum NotificationCardType {
  CardExpired = 'CardExpired',
  CardRevoked = 'CardRevoked',
}

type RecordTypes = NotificationRecord | HistoryRecord | AppNotificationRecord
export type HistoryQuery = {
  type: RecordType
}
