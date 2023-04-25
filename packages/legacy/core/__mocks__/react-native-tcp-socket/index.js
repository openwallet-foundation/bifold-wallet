import { JsonTransformer } from '@aries-framework/core'
import events from 'events'

// const eventEmitter = new events.EventEmitter()

let aNode = undefined

const ports = {
  connect: 8001,
  error: 8002,
  timeout: 8003,
}

const on = (event, cb) => {
  switch (event) {
    case 'timeout':
      if (aNode.port === ports.timeout) {
        cb()
      }
      break
    case 'error':
      if (aNode.port === ports.error) {
        cb()
      }
      break
    default:
      break
  }
}

const client = {
  on,
  destroy: jest.fn(),
  setTimeout: jest.fn(),
  removeAllListeners: jest.fn(),
}

const createConnection = jest.fn((node, cb) => {
  aNode = node

  if (node.port === ports.connect) {
    cb()
  }

  return client
})

export default { createConnection }
