/* eslint-disable no-console */
import axios from 'axios'
import { Buffer } from 'buffer'
import { transportFunctionType } from 'react-native-logs'

export interface RemoteLoggerOptions {
  lokiUrl?: string
  lokiLabels?: Record<string, string>
  autoDisableRemoteLoggingIntervalInMinutes?: number
  job?: string
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

export const lokiTransport: transportFunctionType = (props: LokiTransportProps) => {
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

  const { lokiUrl, lokiLabels } = props.options
  const { message, data } = props.rawMsg.pop()
  const payload = {
    streams: [
      {
        stream: {
          job: props.options.job ?? 'react-native-logs',
          level: props.level.text,
          ...lokiLabels,
        },
        values: [[`${Date.now()}${timestampEndPadding}`, JSON.stringify({ message, data })]],
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
