import { BifoldLogger } from '../../src/services/logger'

export class MockLogger extends BifoldLogger {
  constructor() {
    super()
  }

  public test = jest.fn()
  public trace = jest.fn()
  public debug = jest.fn()
  public info = jest.fn()
  public warn = jest.fn()
  public error = jest.fn()
  public fatal = jest.fn()
  public report = jest.fn()
}
