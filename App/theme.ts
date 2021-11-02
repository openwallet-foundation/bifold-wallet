import { Theme } from '@emotion/react'

export interface AppTheme extends Theme {
  colors: Record<string, string>
}

// yellow = #ffff00

const myTheme: AppTheme = {
  colors: {
    mainColor: '#35823f',
    textColor: '#fff',
    backgroundColor: '#1c1c1e', // '#000',
    shadow: '#1c1c1e',
    white: '#ffff',
  },
}

export default myTheme
