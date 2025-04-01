const reactI18Next: any = jest.createMockFromModule('react-i18next')

const t = (str: string) => str

reactI18Next.useTranslation = () => {
  return {
    t,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      language: 'en',
      t,
    },
  }
}

reactI18Next.initReactI18next = {
  type: '3rdParty',
  init: jest.fn(),
}

reactI18Next.Trans = ({ i18nKey }: { i18nKey: string }) => i18nKey

module.exports = reactI18Next

export default {}
