/**
 *  USAGE
        const historyManager = container.resolve(TOKENS.FN_LOAD_HISTORY)(newAgent)
         const recordData: HistoryRecord = {
           type: HistoryCardType.CardAccepted,
           message: `Wallet Initialized at ${new Date()}`,
           createdAt: new Date(),
           correspondenceId: 'Some data',
           correspondenceName: 'Some name',
         }
        await historyManager.saveHistory(recordData)
        
        const allRecords = await historyManager.getHistoryItems({ type: RecordType.HistoryRecord })
        console.log("$$:", JSON.stringify(allRecords))
 * 
 */

import { Agent } from '@credo-ts/core'
import { GenericRecordTags } from '@credo-ts/core/build/modules/generic-records/repository/GenericRecord'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { ConsoleLogger } from '../../../services/logger'
import QueeManager from '../services/quee.service'
import {
  AppNotificationRecord,
  CustomRecord,
  HistoryQuery,
  HistoryRecord,
  IHistoryManager,
  NotificationRecord,
  RecordType,
} from '../types'

export enum HistorySettingsOptionStorageKey {
  HistorySettingsOption = 'historySettingsOption',
}
export default class HistoryManager implements IHistoryManager {
  private agent: Agent<any>
  private logger = new ConsoleLogger()
  public constructor(agent: Agent<any>) {
    this.agent = agent
    this.trace(`[${HistoryManager.name}]: History module loaded!`)
  }

  private async addGenericRecord(customRecord: CustomRecord, type: RecordType): Promise<void> {
    try {
      if (!this.agent) {
        this.error(`[${HistoryManager.name}]: Add generic record: Agent not set yet adding generic record into quee`)
        QueeManager.getInstance()?.addQuee({ customRecord, type })
        return
      }
      const tags = {
        type: type,
      }
      const storedContent = customRecord.content as unknown as Record<string, unknown>
      this.trace(`[${HistoryManager.name}]: Adding history record:${JSON.stringify(storedContent)}`)
      this.trace(`[${HistoryManager.name}]: >> Tags:${JSON.stringify(tags)}`)
      await this.agent.genericRecords.save({
        content: storedContent,
        tags: tags,
      })
    } catch (e: unknown) {
      this.error(`[${HistoryManager.name}]: Add generic record: ${e}`)
      throw new Error(`${e}`)
    }
  }

  private error(message: string, data?: Record<string, any>): void {
    this.logger.error(message, data)
  }

  private trace(message: string, data?: Record<string, any>): void {
    this.logger.trace(message, data)
  }

  private async getGenericRecordsbyQuery(query: Partial<GenericRecordTags>): Promise<CustomRecord[]> {
    try {
      if (!this.agent) {
        this.error(`[${HistoryManager.name}]: Find generic record by query: Agent not set`)
        throw new Error(`Agent not set `)
      }
      this.trace(`[${HistoryManager.name}]: Searching saved history by query:${JSON.stringify(query)}`)

      const retrievedRecords: CustomRecord[] = []

      const savedRecords = await this.agent.genericRecords.findAllByQuery(query)
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
      this.trace(`[${HistoryManager.name}]: Found saved history length:${retrievedRecords.length}`)
      return retrievedRecords
    } catch (e: unknown) {
      this.error(`[${HistoryManager.name}]: Find generic record by query: ${e}`)
      throw new Error(`${e}`)
    }
  }

  // PUBLIC
  public async saveHistory(recordData: HistoryRecord) {
    const historySettingsOption = await AsyncStorage.getItem(HistorySettingsOptionStorageKey.HistorySettingsOption)
    // Save History when history settigs option is not 'Never'
    if (!(historySettingsOption === 'Never')) {
      await this.addGenericRecord(
        {
          content: recordData,
        },
        RecordType.HistoryRecord
      )
    }
  }

  public async getHistoryItems(query: HistoryQuery): Promise<CustomRecord[]> {
    return this.getGenericRecordsbyQuery(query)
  }
}
