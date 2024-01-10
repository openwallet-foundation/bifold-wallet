import axios from 'axios'
import { BaseLogger } from '@aries-framework/core'
import { logger, transportFunctionType, consoleTransport } from 'react-native-logs'
import { DeviceEventEmitter, EmitterSubscription } from 'react-native'

export interface RemoteLoggerOptions {
  lokiUrl?: string
  lokiLabels?: Record<string, string>
  autoDisableRemoteLoggingIntervalInMinutes?: number
}

type LokiTransportProps = {
  msg: any
  rawMsg: any
  level: {
    severity: number
    text: string
  }
  options?: RemoteLoggerOptions
}

export enum RemoteLoggerEventTypes {
  ENABLE_REMOTE_LOGGING = 'RemoteLogging.Enable',
}

const lokiTransport: transportFunctionType = (props: LokiTransportProps) => {
  // Loki requires a timestamp with nanosecond precision
  // however Date.now() only returns milliseconds precision.
  const timestampEndPadding = '000000'

  if (!props.options) {
    throw Error('props.options is required')
  }

  if (!props.options.lokiUrl) {
    throw Error('props.options.lokiUrl is required')
  }

  if (!props.options.lokiLabels) {
    throw Error('props.options.labels is required')
  }

  if (!props.options.lokiUrl) {
    throw new Error('Loki URL is missing')
  }

  const { lokiUrl, lokiLabels } = props.options
  const { message, data } = props.rawMsg.pop()
  const payload = {
    streams: [
      {
        stream: {
          job: 'react-native-logs',
          level: props.level.text,
          ...lokiLabels,
        },
        values: [[`${Date.now()}${timestampEndPadding}`, JSON.stringify({ message, data })]],
      },
    ],
  }

  axios
    .post(lokiUrl, payload)
    .then((res) => {
      if (res.status !== 204) {
        console.warn(`Expected Loki to return 204, received ${res.status}`)
      }
    })
    .catch((error) => {
      console.error(`Error while sending to Loki, ${error}`)
    })
}

export class RemoteLogger extends BaseLogger {
  private _remoteLoggingEnabled = false
  private _sessionId: number | undefined
  private _autoDisableRemoteLoggingIntervalInMinutes = 0
  private lokiUrl: string | undefined
  private lokiLabels: Record<string, string>
  private remoteLoggingAutoDisableTimer: ReturnType<typeof setTimeout> | undefined
  private eventListener: EmitterSubscription | undefined
  private log: any
  private config = {
    levels: {
      test: 0,
      trace: 0,
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4,
    },
    severity: 'debug',
    async: true,
    dateFormat: 'time',
    printDate: false,
  }

  constructor(options: RemoteLoggerOptions) {
    super()

    this.lokiUrl = options.lokiUrl ?? undefined
    this.lokiLabels = options.lokiLabels ?? {}
    this._autoDisableRemoteLoggingIntervalInMinutes = options.autoDisableRemoteLoggingIntervalInMinutes ?? 0

    this.configureLogger()
  }

  get sessionId(): number {
    if (!this._sessionId) {
      this._sessionId = Math.floor(100000 + Math.random() * 900000)
    }

    return this._sessionId
  }

  get autoDisableRemoteLoggingIntervalInMinutes(): number {
    return this._autoDisableRemoteLoggingIntervalInMinutes
  }

  get remoteLoggingEnabled(): boolean {
    return this._remoteLoggingEnabled
  }

  set remoteLoggingEnabled(value: boolean) {
    this._remoteLoggingEnabled = value

    if (value === false) {
      this._sessionId = undefined
    }

    this.configureLogger()
  }

  private configureLogger() {
    const transportOptions = {}
    const transport = [consoleTransport]
    const config = {
      ...this.config,
      transport,
      transportOptions,
    }

    if (this.remoteLoggingEnabled && this.lokiUrl) {
      transport.push(lokiTransport)
      config['transportOptions'] = {
        lokiUrl: this.lokiUrl,
        lokiLabels: {
          ...this.lokiLabels,
          sessionId: this.sessionId,
        },
      }

      if (this.autoDisableRemoteLoggingIntervalInMinutes && this.autoDisableRemoteLoggingIntervalInMinutes > 0) {
        this.remoteLoggingAutoDisableTimer = setTimeout(() => {
          this.remoteLoggingEnabled = false
        }, this.autoDisableRemoteLoggingIntervalInMinutes * 60000)
      }
    }

    this.log = logger.createLogger<'test' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>(config)
  }

  public startEventListeners() {
    this.eventListener = DeviceEventEmitter.addListener(RemoteLoggerEventTypes.ENABLE_REMOTE_LOGGING, (value) => {
      this.remoteLoggingEnabled = value
    })
  }

  public stopEventListeners() {
    this.eventListener = undefined
  }

  public test(message: string, data?: Record<string, any> | undefined): void {
    this.log.test({ message, data })
  }

  public trace(message: string, data?: Record<string, any> | undefined): void {
    this.log.trace({ message, data })
  }

  public debug(message: string, data?: Record<string, any> | undefined): void {
    this.log.debug({ message, data })
  }

  public info(message: string, data?: Record<string, any> | undefined): void {
    this.log.info({ message, data })
  }

  public warn(message: string, data?: Record<string, any> | undefined): void {
    this.log.warn({ message, data })
  }

  public error(message: string, data?: Record<string, any> | undefined): void {
    this.log.error({ message, data })
  }

  public fatal(message: string, data?: Record<string, any> | undefined): void {
    this.log.fatal({ message, data })
  }
}
