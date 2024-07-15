import { CustomRecord, RecordType } from '../types'

interface HistoryQueeItem {
  customRecord: CustomRecord
  type: RecordType
}
export default class QueeManager {
  private recordsQuee: HistoryQueeItem[]
  public constructor() {
    this.recordsQuee = []
  }

  // public
  public addQuee(item: HistoryQueeItem) {
    this.recordsQuee.push(item)
  }

  public getLast(): HistoryQueeItem | undefined {
    return this.recordsQuee.pop()
  }

  // Static methods
  private static myInstance: QueeManager | null = null
  public static getInstance(): QueeManager | null {
    if (QueeManager.myInstance == null) {
      QueeManager.myInstance = new QueeManager()
    }

    return this.myInstance
  }
}
