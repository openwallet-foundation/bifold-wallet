import { GenericRecord } from '@credo-ts/core/build/modules/generic-records/repository/GenericRecord'
import { Moment } from 'moment'

export interface IHistoryManager {
  saveHistory: (recordData: HistoryRecord) => Promise<void>
  getHistoryItems: (query: HistoryQuery) => Promise<CustomRecord[]>
  findGenericRecordById: (id: string) => Promise<GenericRecord | null>
  removeGenericRecord: (genericRecord: GenericRecord) => Promise<void>
  handleStoreHistorySettings: (selectedValue: HistoryBlockSelection | undefined) => Promise<void>
  getStoredHistorySettingsOption: () => Promise<string | null>
  getHistorySettingsOptionList: () => Array<HistoryBlockSelection>
}

export interface HistoryBlockSelection {
  value: string
  id: string
  key?: number
  date?: Moment
}

export enum HistoryCardType {
  CardAccepted = 'CardAccepted',
  CardDeclined = 'CardDeclined',
  CardExpired = 'CardExpired', // TODO: log this type of event
  CardRemoved = 'CardRemoved',
  CardRevoked = 'CardRevoked', // TODO: log this type of event
  CardUpdates = 'CardUpdates', // TODO: log this type of event
  PinChanged = 'PinChanged',
  InformationSent = 'InformationSent',
  InformationNotSent = 'InformationNotSent',
  Connection = 'Connection',
  ConnectionRemoved = 'ConnectionRemoved',
  ActivateBiometry = 'ActivateBiometry',
  DeactivateBiometry = 'DeactivateBiometry',
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
