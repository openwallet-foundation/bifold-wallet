import AsyncStorage from '@react-native-async-storage/async-storage'
import { BaseLogger } from '@credo-ts/core'

// TODO: should monitor for any shutdowns and save state?
// TODO: add `language` to an enum, convert enums to `as const`
// const storeLanguage = async (id: string) => {
//   await AsyncStorage.setItem('language', id)
// }

export class PersistentStorage<T> {
  private _state?: T
  private log?: BaseLogger

  constructor(state: T, logger: any) {
    this._state = state
    this.log = logger
  }

  public async setValueForKey(key: string, value: Partial<T>) {
    if (!this._state) {
      throw new Error("State hasn't been initialized")
    }

    // @ts-expect-error
    this._state[key] = value

    try {
      const serializedState = JSON.stringify(value)
      await AsyncStorage.setItem(key, serializedState)
    } catch (error) {
      this.log?.error(`Error saving state for key ${key}, ${error as Error}`)
    }
  }

  public async getValueForKey(key: string): Promise<Partial<T> | undefined> {
    if (!this._state) {
      await this.load()
    }

    // @ts-expect-error
    return this._state[key]
  }

  public async flush() {
    if (!this._state) {
      return
    }

    try {
      const keys = Object.keys(this._state)
      for (const key of keys) {
        // @ts-expect-error
        const value = this._state[key]
        const serializedState = JSON.stringify(value)
        await AsyncStorage.setItem(key, serializedState)
      }
    } catch (error) {
      this.log?.error('Error saving state', error as Error)
    }
  }

  public async load() {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const items = await AsyncStorage.multiGet(keys)

      items.forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return
        }

        // @ts-expect-error
        this._state[key] = JSON.parse(value)
      })
    } catch (error) {
      this.log?.error('Error loading state', error as Error)
    }
  }
}
