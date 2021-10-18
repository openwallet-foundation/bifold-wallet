import { LOGIN_FAIL, LOGIN_SUCCESS, REGISTER_FAIL, REGISTER_SUCCESS } from './types'
import * as Keychain from 'react-native-keychain'
import { getTimeStamp } from '../../utils/Utils'

export const signInUserAction = (pin) => {
  return (dispatch) => {
    Keychain.getGenericPassword({ service: 'passcode' })
      .then((keychainEntry) => {
        if (keychainEntry && JSON.stringify(pin) === keychainEntry.password) {
          dispatch({ type: LOGIN_SUCCESS, payload: { pin: pin, error: '' } })
        } else {
          dispatch({
            type: LOGIN_FAIL,
            payload: {
              pin: pin,
              error: 'Pin mismatch',
              operation: getTimeStamp(),
            },
          })
        }
      })
      .catch((error) => {
        dispatch({
          type: LOGIN_FAIL,
          payload: {
            pin: pin,
            error: `Generic error:${error}`,
            operation: getTimeStamp(),
          },
        })
      })
  }
}

export const authenticateUserAction = (pin) => {
  return (dispatch) => {
    const passcode = JSON.stringify(pin)
    const description = 'user authentication pin'
    Keychain.setGenericPassword(description, passcode, {
      service: 'passcode',
    })
      .then((keychainEntry) => {
        dispatch({ type: REGISTER_SUCCESS, payload: { pin: pin, error: '' } })
      })
      .catch((error) => {
        dispatch({
          type: REGISTER_FAIL,
          payload: {
            pin: pin,
            error: `Generic error:${error}`,
            operation: getTimeStamp(),
          },
        })
      })
  }
}
