import { LOGIN_FAIL, LOGIN_SUCCESS, REGISTER_FAIL, REGISTER_SUCCESS } from '../actions/types'

const INITIAL_STATE = { loggedIn: false, pin: '', error: '', operation: 0 }

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case REGISTER_SUCCESS:
      return { ...state, loggedIn: true, pin: action.payload.pin }
    case REGISTER_FAIL:
      return {
        ...state,
        loggedIn: false,
        pin: action.payload.pin,
        error: action.payload.error,
        operation: action.payload.operation,
      }
    case LOGIN_SUCCESS:
      return { ...state, loggedIn: true, pin: action.payload.pin }
    case LOGIN_FAIL:
      return {
        ...state,
        loggedIn: false,
        pin: action.payload.pin,
        error: action.payload.error,
        operation: action.payload.operation,
      }
    default:
      return state
  }
}
