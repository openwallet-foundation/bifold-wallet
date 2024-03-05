// import SecureStorage from 'react-native-secure-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

const secureConfig = {}

// export const clearSecureStorage = async (): Promise<void> => {
//     const keys = await SecureStorage.getAllKeys()

//     for await (const key of keys) {
//         await SecureStorage.removeItem(key, secureConfig)
//     }
// }

export const setItem = async (key: string, item: any): Promise<void> => {
    return await AsyncStorage.setItem(key, JSON.stringify(item))
}

export const getItem = async (key: string): Promise<any | null> => {
    const item = await AsyncStorage.getItem(key)
    return item && JSON.parse(item)
}

export const removeItem = async (key: string): Promise<void> => {
    return await AsyncStorage.removeItem(key)
}