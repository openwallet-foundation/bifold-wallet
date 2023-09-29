const mockT = jest.fn((key: string) => key)
const useTranslation = () => {
  return {
    t: mockT,
    i18n: {
      language: 'en',
    },
  }
}

export { useTranslation }
