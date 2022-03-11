import { testIdPrefix } from '../constants'

export const testIdWithKey = (key: string): string => {
  return `${testIdPrefix}${key}`
}
