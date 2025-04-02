const store = {}

export default class AsyncStorage {
  static getItem = (key) => {
    return store[key]
  }

  static setItem = (key, value) => {
    store[key] = value

    return null
  }
}
