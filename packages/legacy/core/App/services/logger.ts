/* eslint-disable no-console,@typescript-eslint/no-explicit-any */

export enum LogLevel {
  test = 0,
  trace = 1,
  debug = 2,
  info = 3,
  warn = 4,
  error = 5,
  fatal = 6,
  off = 7,
}

export interface Logger {
  logLevel: LogLevel

  test(message: string, data?: Record<string, any>): void
  trace(message: string, data?: Record<string, any>): void
  debug(message: string, data?: Record<string, any>): void
  info(message: string, data?: Record<string, any>): void
  warn(message: string, data?: Record<string, any>): void
  error(message: string, data?: Record<string, any>): void
  fatal(message: string, data?: Record<string, any>): void
}

const replaceError = (_: unknown, value: unknown) => {
  if (value instanceof Error) {
    const newValue = Object.getOwnPropertyNames(value).reduce(
      (obj, propName) => {
        obj[propName] = (value as unknown as Record<string, unknown>)[propName]
        return obj
      },
      { name: value.name } as Record<string, unknown>
    )
    return newValue
  }

  return value
}

export class AppConsoleLogger {
  public logLevel: LogLevel

  // Map our log levels to console levels
  private consoleLogMap = {
    [LogLevel.test]: 'log',
    [LogLevel.trace]: 'log',
    [LogLevel.debug]: 'debug',
    [LogLevel.info]: 'info',
    [LogLevel.warn]: 'warn',
    [LogLevel.error]: 'error',
    [LogLevel.fatal]: 'error',
  } as const

  public constructor(logLevel: LogLevel = LogLevel.off) {
    this.logLevel = logLevel
  }

  public log(level: Exclude<LogLevel, LogLevel.off>, message: string, data?: Record<string, any>): void {
    // Get console method from mapping
    const consoleLevel = this.consoleLogMap[level]

    // Get logger prefix from log level names in enum
    const prefix = LogLevel[level].toUpperCase()

    // Return early if logging is not enabled for this level
    if (!this.isEnabled(level)) {
      console.log('logger disabled')
      return
    }

    // Log, with or without data
    if (data) {
      console[consoleLevel](
        `${prefix}: ${new Date().toISOString()} - ${message}`,
        JSON.stringify(data, replaceError, 2)
      )
    } else {
      console[consoleLevel](`${prefix}:  ${new Date().toISOString()} - ${message}`)
    }
  }

  private isEnabled(logLevel: LogLevel) {
    return logLevel >= this.logLevel
  }
}
