import { testIdPrefix } from '../constants'

export const testIdWithKey = (key: string): string => {
  return `${testIdPrefix}${key}`
}

export const testIdForAccessabilityLabel = (label: string) => {
  if (!label) {
    return ''
  }

  return label
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s/g, '')
}
