import AsyncStorage from '@react-native-async-storage/async-storage'
import { BaseLogger } from '@credo-ts/core'

export class PersistentStorage<T> {
  private _state?: T
  private log?: BaseLogger

  constructor(logger: any) {
    // this._state = state
    this.log = logger
  }

  public static fetchValueForKey = async <T>(key: string, log?: BaseLogger): Promise<T | undefined> => {
    try {
      const value = await AsyncStorage.getItem(key)
      if (!value) {
        return
      }

      return JSON.parse(value)
    } catch (error) {
      log?.error(`Error loading state for key ${key}, ${error as Error}`)
    }
  }

  public static storeValueForKey = async <T>(key: string, value: T, log?: BaseLogger): Promise<void> => {
    try {
      const serializedState = JSON.stringify(value)
      return AsyncStorage.setItem(key, serializedState)
    } catch (error) {
      log?.error(`Error loading state for key ${key}, ${error as Error}`)

      throw error
    }
  }

  public static removeValueForKey = async (key: string, log?: BaseLogger): Promise<void> => {
    try {
      return AsyncStorage.removeItem(key)
    } catch (error) {
      log?.error(`Error removing state for key ${key}, ${error as Error}`)

      throw error
    }
  }

  public async setValueForKey(key: string, value: Partial<T>) {
    if (!this._state) {
      throw new Error("State hasn't been initialized")
    }

    // @ts-expect-error Fix complicated type error
    this._state[key] = value

    try {
      const serializedState = JSON.stringify(value)
      await AsyncStorage.setItem(key, serializedState)
    } catch (error) {
      this.log?.error(`Error saving state for key ${key}, ${error as Error}`)
    }
  }

  public async getValueForKey(key: string): Promise<Partial<T> | undefined> {
    try {
      if (!this._state) {
        await this.load()
      }

      // @ts-expect-error Fix complicated type error.
      return this._state[key] as Partial<T>
    } catch (error) {
      this.log?.error(`Error loading state for key ${key}, ${error as Error}`)
    }
  }

  public async migrateStorageKey(oldKey: string, newKey: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(oldKey)
      if (!value) {
        return false
      }

      await AsyncStorage.setItem(newKey, value)
      await AsyncStorage.removeItem(oldKey)

      // @ts-expect-error Fix complicated type error
      delete this._state[oldKey]
      // @ts-expect-error Fix complicated type error
      this._state[newKey] = JSON.parse(value)

      return true
    } catch (error) {
      this.log?.error(`Error migrating state for key ${oldKey}, ${error as Error}`)
    }

    return false
  }

  public async flush() {
    if (!this._state) {
      return
    }

    try {
      const keys = Object.keys(this._state)
      for (const key of keys) {
        // @ts-expect-error Fix complicated type error
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

        const parsedValue = JSON.parse(value)

        // @ts-expect-error Fix complicated type error
        this._state = { ...this._state, [key]: parsedValue }
      })
    } catch (error) {
      this.log?.error('Error loading state', error as Error)
    }
  }
}
