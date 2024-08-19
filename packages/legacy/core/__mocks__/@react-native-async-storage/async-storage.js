const AsyncStorage = {}

const store = {}

AsyncStorage.getItem = (key) => {
  return store[key]
}

AsyncStorage.setItem = (key, value) => {
  store[key] = value

  return null
}

export default AsyncStorage
