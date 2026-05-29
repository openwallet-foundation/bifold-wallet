import { i18n } from '../localization'

// Select the best metadata display entry for the active language. We prefer exact locale matches,
// then base-language matches, then an issuer-provided default, then the first entry.
export const findLocalizedDisplay = <T extends { locale?: string }>(display?: T[], language?: string): T | undefined => {
  if (!display?.length) return undefined

  const normalizedLanguage = (language ?? i18n.language ?? 'en').toLowerCase()
  const baseLanguage = normalizedLanguage.split('-')[0]

  return (
    display.find((item) => item.locale?.toLowerCase() === normalizedLanguage) ??
    display.find((item) => item.locale?.toLowerCase().split('-')[0] === baseLanguage) ??
    display.find((item) => !item.locale) ??
    display[0]
  )
}
