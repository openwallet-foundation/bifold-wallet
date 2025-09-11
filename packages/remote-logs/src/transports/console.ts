/* eslint-disable no-console */

import { transportFunctionType } from 'react-native-logs'

const availableColors = {
  default: null,
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  grey: 90,
  redBright: 91,
  greenBright: 92,
  yellowBright: 93,
  blueBright: 94,
  magentaBright: 95,
  cyanBright: 96,
  whiteBright: 97,
} as const

const resetColors = '\x1b[0m'

type Color = keyof typeof availableColors

export interface ConsoleLoggerOptions {
  colors?: Record<string, Color>
  extensionColors?: Record<string, Color>
  consoleFunc?: (msg: string) => void
}

export type ConsoleTransportProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  msg: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawMsg: any
  level: {
    severity: number
    text: string
  }
  extension?: string | null | undefined
  options?: ConsoleLoggerOptions
}

const messageDataFormatter = (...msgs: unknown[]): unknown[] => {
  return msgs.map((msg) => {
    if (msg instanceof Error) {
      return JSON.stringify(
        {
          name: msg.name,
          message: msg.message,
          stack:
            msg.stack
              ?.split('\n')
              .slice(1)
              .map((line) => line.trim()) ?? [],
        },
        null,
        2
      )
    }

    if (typeof msg === 'object' && msg !== null) {
      try {
        return JSON.stringify(msg, null, 2)
      } catch (error) {
        // Handle JSON serialization errors (circular references, BigInt, etc.)
        if (error instanceof TypeError && error.message.includes('circular')) {
          return '[Circular Reference]'
        }
        if (error instanceof TypeError && error.message.includes('BigInt')) {
          return '[BigInt value cannot be serialized]'
        }
        // Handle other JSON serialization errors
        return `[Serialization Error: ${error instanceof Error ? error.message : 'Unknown error'}]`
      }
    }

    return msg
  })
}

export const consoleTransport: transportFunctionType = (props: ConsoleTransportProps) => {
  if (!props?.rawMsg?.length) {
    return
  }

  // Get the last element without mutating the
  // original array.
  const lastMessage = props.rawMsg[props.rawMsg.length - 1]
  if (!lastMessage) {
    return
  }

  // Destructure the message and rest properties, allow
  // ...rest to be `const`, message to be `let`.
  let { message } = lastMessage
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { message: _, ...rest } = lastMessage
  let color

  if (
    props.options?.colors &&
    props.options.colors[props.level.text] &&
    availableColors[props.options.colors[props.level.text]]
  ) {
    color = `\x1b[${availableColors[props.options.colors[props.level.text]]}m`
    message = `${color}${message}${resetColors}`
  }

  if (props.extension && props.options?.extensionColors) {
    let extensionColor = '\x1b[7m'

    const extColor = props.options.extensionColors[props.extension]
    if (extColor && availableColors[extColor]) {
      extensionColor = `\x1b[${availableColors[extColor] + 10}m`
    }

    const extStart = color ? resetColors + extensionColor : extensionColor
    const extEnd = color ? resetColors + color : resetColors
    message = message.replace(props.extension, `${extStart} ${props.extension} ${extEnd}`)
  }

  let logMessage = message.trim()
  if (Object.keys(rest).length > 0) {
    const formattedData = messageDataFormatter(...Object.values(rest)).join(' ')
    logMessage = `${logMessage} ${formattedData}`
  }

  if (props.options?.consoleFunc) {
    props.options.consoleFunc(logMessage)
  } else {
    console.log(logMessage)
  }
}
