/* eslint-disable no-console */
import { LogLevel } from '@credo-ts/core'
import axios from 'axios'
import { Buffer } from 'buffer'
import { transportFunctionType } from 'react-native-logs'

export interface RemoteLoggerOptions {
  lokiUrl?: string
  lokiLabels?: Record<string, string>
  autoDisableRemoteLoggingIntervalInMinutes?: number
  job?: string
  logLevel?: LogLevel
}

export type LokiTransportProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  msg: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawMsg: any
  level: {
    severity: number
    text: string
  }
  options?: RemoteLoggerOptions
}

// Fields stripped from cause errors: stack is redundant; config/request/response
// can contain PII we want to omit
const CAUSE_OMIT = new Set(['stack', 'config', 'request', 'response'])

// Extract the response body from an error, if present
const extractResponseData = (error: Error): Record<string, unknown> => {
  const data = (error as { response?: { data?: unknown } }).response?.data
  if (typeof data === 'string') {
    return { responseData: data }
  }
  return {}
}

const serializeError = (error: Error, depth = 0): Record<string, unknown> => {
  const ownProps = Object.fromEntries(
    Object.entries(error)
      // filter stack — handled explicitly below
      .filter(([k]) => k !== 'stack' && (depth === 0 || !CAUSE_OMIT.has(k)))
      .map(([k, v]) => [k, v instanceof Error ? serializeError(v, depth + 1) : v])
  )

  return {
    name: error.name,
    message: error.message,
    ...(depth === 0 && {
      stack:
        error.stack
          ?.split('\n')
          .slice(1)
          .map((l) => l.trim()) ?? [],
    }),
    cause: error.cause instanceof Error ? serializeError(error.cause, depth + 1) : error.cause,
    ...ownProps,
    ...(depth > 0 && extractResponseData(error)),
  }
}

const errorReplacer = (_key: string, value: unknown): unknown =>
  value instanceof Error ? serializeError(value) : value

export const lokiTransport: transportFunctionType = (props: LokiTransportProps) => {
  // Loki requires a timestamp with nanosecond precision
  // however Date.now() only returns milliseconds precision.
  const timestampEndPadding = '000000'

  if (!props?.options) {
    throw Error('props.options is required')
  }

  if (!props.options.lokiUrl) {
    throw Error('props.options.lokiUrl is required')
  }

  if (!props.options.lokiLabels) {
    throw Error('props.options.labels is required')
  }

  const { lokiUrl, lokiLabels } = props.options
  // Get the last element without mutating the
  // original array.
  const lastMessage = props.rawMsg[props.rawMsg.length - 1]
  const { message, data, error } = lastMessage

  const payload = {
    streams: [
      {
        stream: {
          job: props.options.job ?? 'react-native-logs',
          level: props.level.text,
          ...lokiLabels,
        },
        values: [[`${Date.now()}${timestampEndPadding}`, JSON.stringify({ message, data, error }, errorReplacer)]],
      },
    ],
  }

  const [credentials, href] = lokiUrl.split('@')
  const [username, password] = credentials.split('//')[1].split(':')
  const protocol = credentials.split('//')[0]
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
  }

  axios
    .post(`${protocol}//${href}`, payload, config)
    .then((res) => {
      if (res.status !== 204) {
        console.warn(`Expected Loki to return 204, received ${res.status}`)
      }
    })
    .catch((error) => {
      console.error(`Error while sending to Loki, ${error}`)
    })
}
