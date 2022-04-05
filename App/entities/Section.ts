import { Translations } from '../types/Translations'
import { SectionTranslation } from '../types/SectionTranslation'

export class Section {
  id: string
  translations: Translations<SectionTranslation>

  constructor(id: string, translations: Translations<SectionTranslation>) {
    this.id = id
    this.translations = translations
    return this
  }
}
