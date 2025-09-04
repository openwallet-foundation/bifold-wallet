import { consoleTransport } from 'react-native-logs'
import { logger } from 'react-native-logs'

import { BifoldError } from '../types/error'
import { AbstractBifoldLogger } from './AbstractBifoldLogger'

export class BifoldLogger extends AbstractBifoldLogger {
  public constructor() {
    super()

    const transport = [consoleTransport]
    const config = {
      ...this._config,
      transport,
    }

    this._log = logger.createLogger<'test' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>(config)
  }

  public report(bifoldError: BifoldError): void {
    this._log?.info({ message: 'No remote logging configured, report not sent for error:', data: bifoldError.message })
  }
}
