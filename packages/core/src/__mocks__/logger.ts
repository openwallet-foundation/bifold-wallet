import { AbstractBifoldLogger } from '../services/AbstractBifoldLogger'

/**
 * Mock logger to reduce noise in tests
 */
export class MockLogger extends AbstractBifoldLogger {
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
