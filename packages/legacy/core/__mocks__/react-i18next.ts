const mockT = jest.fn((key: string) => key)
const useTranslation = jest.fn().mockReturnValue({
  t: mockT,
  i18n: {
    language: 'en',
  },
})

export { useTranslation }
