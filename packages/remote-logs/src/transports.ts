import axios, { AxiosRequestConfig } from 'axios'
import { transportFunctionType } from 'react-native-logs'

export interface RemoteLoggerOptions {
  lokiUrl?: string
  lokiLabels?: Record<string, string>
  autoDisableRemoteLoggingIntervalInMinutes?: number
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
  const url = new URL(lokiUrl)
  const axiosConfig: AxiosRequestConfig = {
    method: 'post',
    url: lokiUrl,
    data: payload,
  }

  // If username and password are present
  // in the URL, use them for auth
  if (url.username && url.password) {
    axiosConfig.auth = {
      username: url.username,
      password: url.password,
    }
    // Clear the username and password from
    // the URL
    url.username = ''
    url.password = ''
    axiosConfig.url = url.href
  }

  axios(axiosConfig)
    .then((res) => {
      if (res.status !== 204) {
        throw new Error(`Expected Loki to return 204, received ${res.status}`)
      }
    })
    .catch((error) => {
      throw new Error(`Error while sending to Loki, ${error}`)
    })
}
