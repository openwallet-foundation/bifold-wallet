import { BrandingOverlayType, DefaultOCABundleResolver } from '@bifold/oca/build/legacy'

const { TOKENS: T } = jest.requireActual('../../src/container-api')

export { T as TOKENS }

// eslint-disable-next-line @typescript-eslint/no-var-requires
const resolver = new DefaultOCABundleResolver(require('../../src/assets/oca-bundles.json'), {
  brandingOverlayType: BrandingOverlayType.Branding10,
})

export const useContainer = jest.fn().mockReturnValue({
  resolve: (token: typeof T) => {
    switch (token) {
      case T.UTIL_OCA_RESOLVER:
        return resolver
      case T.CRED_HELP_ACTION_OVERRIDES:
        return []
      case T.NOTIFICATIONS:
        return { useNotifications: jest.fn(), customNotificationConfig: undefined }
      default:
        return undefined
    }
  },
})

// export const useContainer = jest.fn().mockReturnValue({
//   resolve: jest.fn().mockReturnValue({
//     resolve: jest.fn().mockImplementation(() => Promise.resolve({})),
//     resolveAllBundles: jest.fn().mockImplementation(() => Promise.resolve({})),
//   }),
// })
