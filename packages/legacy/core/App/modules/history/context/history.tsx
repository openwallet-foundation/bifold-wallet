import {
  GenericRecord,
  GenericRecordTags,
} from '@aries-framework/core/build/modules/generic-records/repository/GenericRecord'
import { useAgent } from '@aries-framework/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import React, { createContext, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useCommons } from '../../../contexts/commons'
import { LogLevel } from '../../../services/logger'
import QueeManager from '../services/quee.service'
import {
  AppNotificationRecord,
  CustomRecord,
  HistoryQuery,
  HistoryRecord,
  NotificationRecord,
  RecordType,
} from '../types'
import { BlockSelection } from '../ui/components/SingleSelectBlock'

export enum HistorySettingsOptionStorageKey {
  HistorySettingsOption = 'historySettingsOption',
}

export interface IHistoryContext {
  historySettingsOptionList: Array<BlockSelection>
  saveHistory(recordData: HistoryRecord): Promise<void>
  getHistoryItems(query: HistoryQuery): Promise<CustomRecord[]>
  handleStoreHistorySettings(selectedValue: BlockSelection | undefined): Promise<void>
  getStoredHistorySettingsOption(): Promise<string | null>
  findGenericRecordById(id: string): Promise<GenericRecord | null>
  removeGenericRecord(genericRecord: GenericRecord): Promise<void>
}

export const HistoryContext = createContext<IHistoryContext>(null as unknown as IHistoryContext)

export const HistoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { agent } = useAgent()
  const { log } = useCommons()
  const { t } = useTranslation()

  //Constants
  const oneMonth = moment().subtract(1, 'month')
  const sixMonth = moment().subtract(6, 'month')
  const oneYear = moment().subtract(1, 'year')
  const historySettingsOptionList = [
    { key: 0, id: '1 month', date: oneMonth, value: t('ActivityHistory.DeleteActivityAfter.1month') },
    { key: 1, id: '6 month', date: sixMonth, value: t('ActivityHistory.DeleteActivityAfter.6month') },
    { key: 2, id: '1 year', date: oneYear, value: t('ActivityHistory.DeleteActivityAfter.1year') },
    { key: 3, id: 'Always', value: t('ActivityHistory.DeleteActivityAfter.Always') },
  ]

  async function saveHistory(recordData: HistoryRecord) {
    const historySettingsOption = await AsyncStorage.getItem(HistorySettingsOptionStorageKey.HistorySettingsOption)
    // Save History when history settigs option is not 'Never'
    if (!(historySettingsOption === 'Never')) {
      await addGenericRecord(
        {
          content: recordData,
        },
        RecordType.HistoryRecord
      )
    }
  }

  async function getHistoryItems(query: HistoryQuery): Promise<CustomRecord[]> {
    return getGenericRecordsbyQuery(query)
  }

  //History Settings
  async function getStoredHistorySettingsOption(): Promise<string | null> {
    return await AsyncStorage.getItem(HistorySettingsOptionStorageKey.HistorySettingsOption)
  }

  const handleStoreHistorySettings = async (selectedValue: BlockSelection | undefined) => {
    if (!selectedValue) {
      throw new Error(t('ActivityHistory.NoOptionSelectedError'))
    }

    await AsyncStorage.setItem(HistorySettingsOptionStorageKey.HistorySettingsOption, selectedValue.id)

    //TODO: Delete old history
    /*
    if (selectedValue.id !== 'Always') {
      // Filter history record data and get the ones that needs to be deleted.
      const selectedHistoryRecords = historyItems && filterDataByGivenDate(historyItems, selectedValue.date)
      // Remove history past the selected date.
      if (selectedHistoryRecords) {
        for await (const record of selectedHistoryRecords) {
          const recordHistory = record.content as HistoryRecord
          if (!recordHistory || !recordHistory.id) {
            return
          }
          const deleteRecord = await findGenericRecordById(recordHistory.id)
          if (!deleteRecord) {
            return
          }
          await removeGenericRecord(deleteRecord)
        }
      }
    }
    */
  }

  async function findGenericRecordById(id: string): Promise<GenericRecord | null> {
    try {
      if (!agent) {
        log(`[${HistoryProvider.name}]: Find generic record by id: Agent not set`, LogLevel.error)
        throw new Error(`Agent not set `)
      }
      return await agent.genericRecords.findById(id)
    } catch (e: unknown) {
      log(`[${HistoryProvider.name}]: Find generic record by id: ${e}`, LogLevel.error)
      throw new Error(`${e}`)
    }
  }

  async function removeGenericRecord(genericRecord: GenericRecord): Promise<void> {
    try {
      if (!agent) {
        log(`[${HistoryProvider.name}]: Remove generic record: Agent not set`, LogLevel.error)
        throw new Error(`Agent not set `)
      }
      return await agent.genericRecords.delete(genericRecord)
    } catch (e: unknown) {
      log(`[${HistoryProvider.name}]: Remove generic record: ${e}`, LogLevel.error)
      throw new Error(`${e}`)
    }
  }

  //Internal
  async function addGenericRecord(customRecord: CustomRecord, type: RecordType): Promise<void> {
    try {
      if (!agent) {
        log(
          `[${HistoryProvider.name}]: Add generic record: Agent not set yet adding generic record into quee`,
          LogLevel.trace
        )
        QueeManager.getInstance()?.addQuee({ customRecord, type })
        return
      }
      const tags = {
        type: type,
      }
      const storedContent = customRecord.content as unknown as Record<string, unknown>
      log(`[${HistoryProvider.name}]: Adding history record:${JSON.stringify(storedContent)}`, LogLevel.trace)
      log(`[${HistoryProvider.name}]: >> Tags:${JSON.stringify(tags)}`, LogLevel.trace)
      await agent.genericRecords.save({
        content: storedContent,
        tags: tags,
      })
    } catch (e: unknown) {
      log(`[${HistoryProvider.name}]: Add generic record: ${e}`, LogLevel.error)
      throw new Error(`${e}`)
    }
  }
  async function getGenericRecordsbyQuery(query: Partial<GenericRecordTags>): Promise<CustomRecord[]> {
    try {
      if (!agent) {
        log(`[${HistoryProvider.name}]: Find generic record by query: Agent not set`, LogLevel.error)
        throw new Error(`Agent not set `)
      }
      log(`[${HistoryProvider.name}]: Searching saved history by query:${JSON.stringify(query)}`, LogLevel.trace)

      const retrievedRecords: CustomRecord[] = []

      const savedRecords = await agent.genericRecords.findAllByQuery(query)
      if (savedRecords) {
        savedRecords.forEach((element) => {
          const tags = element.getTags()
          switch (tags.type) {
            case RecordType.AppNotificationRecord: {
              const appNotificationRecord: AppNotificationRecord = element.content as unknown as AppNotificationRecord
              const appNotification: AppNotificationRecord = {
                id: element.id,
                createdAt: element.createdAt,
                type: appNotificationRecord.type,
              }
              retrievedRecords.push({ content: appNotification, tags })
              break
            }
            case RecordType.NotificationRecord: {
              const notificationRecord: NotificationRecord = element.content as unknown as NotificationRecord
              const notification: NotificationRecord = {
                message: notificationRecord.message,
                credentialId: notificationRecord.credentialId,
                type: notificationRecord.type,
                id: element.id,
                createdAt: element.createdAt,
                isNotificationRemoved: notificationRecord.isNotificationRemoved,
              }
              retrievedRecords.push({ content: notification, tags })
              break
            }
            case RecordType.HistoryRecord: {
              const historyRecord: HistoryRecord = element.content as unknown as HistoryRecord
              const history: HistoryRecord = {
                message: historyRecord.message,
                id: element.id,
                createdAt: element.createdAt,
                type: historyRecord.type,
                correspondenceId: historyRecord.correspondenceId,
                correspondenceName: historyRecord.correspondenceName,
              }
              retrievedRecords.push({ content: history, tags })
              break
            }
            default: {
              break
            }
          }
        })
      }
      log(`[${HistoryProvider.name}]: Found saved history length:${retrievedRecords.length}`, LogLevel.trace)
      return retrievedRecords
    } catch (e: unknown) {
      log(`[${HistoryProvider.name}]: Find generic record by query: ${e}`, LogLevel.error)
      throw new Error(`${e}`)
    }
  }

  async function checkQuee() {
    if (!agent) {
      log(`[${HistoryProvider.name}]: Check quee: Agent not set`, LogLevel.error)
      throw new Error(`Agent not set: cannot check quee`)
    }
    try {
      const queedItem = QueeManager.getInstance()?.getLast()
      if (queedItem) {
        log(`[${HistoryProvider.name}]: Check quee: A quee items found - ` + JSON.stringify(queedItem), LogLevel.trace)
        await addGenericRecord(queedItem.customRecord, queedItem.type)
        checkQuee()
      } else {
        log(`[${HistoryProvider.name}]: Check quee: No quee items found`, LogLevel.trace)
      }
    } catch (err) {
      log(`[${HistoryProvider.name}]: Check quee: ${err}`, LogLevel.error)
    }
  }

  useEffect(() => {
    if (agent) {
      checkQuee()
    }
  }, [agent])

  return (
    <HistoryContext.Provider
      value={{
        saveHistory: saveHistory,
        getHistoryItems: getHistoryItems,
        historySettingsOptionList: historySettingsOptionList,
        handleStoreHistorySettings: handleStoreHistorySettings,
        getStoredHistorySettingsOption: getStoredHistorySettingsOption,
        findGenericRecordById: findGenericRecordById,
        removeGenericRecord: removeGenericRecord,
      }}
    >
      {children}
    </HistoryContext.Provider>
  )
}

export const useHistory = () => {
  const historyContext = useContext(HistoryContext)
  if (!historyContext) {
    throw new Error('historyContext must be used within a HistoryProvider')
  }
  return historyContext
}
