import { GenericRecordTags } from '@aries-framework/core/build/modules/generic-records/repository/GenericRecord'
import { useAgent } from '@aries-framework/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect } from 'react'

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

export interface IHistoryContext {
  saveHistory(recordData: HistoryRecord): Promise<void>
  getHistoryItems(query: HistoryQuery): Promise<CustomRecord[]>
}

export const HistoryContext = createContext<IHistoryContext>(null as unknown as IHistoryContext)

export const HistoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { agent } = useAgent()
  const { log } = useCommons()

  async function saveHistory(recordData: HistoryRecord) {
    const historySettingsOption = await AsyncStorage.getItem('historySettingsOption')
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
