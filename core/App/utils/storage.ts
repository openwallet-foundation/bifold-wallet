import EncryptedStorage from 'react-native-encrypted-storage'

import { LocalStorageKeys } from '../constants'

export const setTutorialCompletionStatus = async (status: boolean): Promise<boolean> => {
  let didSetTutorialCompletionStatus = false

  try {
    await EncryptedStorage.setItem(LocalStorageKeys.TutorialStatus, status ? 'YES' : 'NO')

    didSetTutorialCompletionStatus = true
  } catch (err) {
    const message = 'Unable to set tutorial status'
    throw Error(message)
  }

  return didSetTutorialCompletionStatus
}

export const tutorialCompletionStatus = async (): Promise<boolean> => {
  let didCompletedTutorial = false

  try {
    const result = await EncryptedStorage.getItem(LocalStorageKeys.TutorialStatus)

    if (result === 'YES') {
      didCompletedTutorial = true
    }
  } catch (err) {
    const message = 'Unable to fetch tutorial status'
    throw Error(message)
  }

  return didCompletedTutorial
}

export const deleteTutorialCompletionStatus = async (): Promise<boolean> => {
  let didRemoveTutorialStatus = false

  try {
    await EncryptedStorage.removeItem(LocalStorageKeys.TutorialStatus)

    didRemoveTutorialStatus = true
  } catch (err) {
    const message = 'Unable to remove tutorial status'
    throw Error(message)
  }

  return didRemoveTutorialStatus
}
