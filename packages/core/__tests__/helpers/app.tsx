import React, { PropsWithChildren, useMemo } from 'react'
import { NetworkContext } from '../../src/contexts/network'

import networkContext from '../contexts/network'
import { Container, ContainerProvider, TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { container } from 'tsyringe'
import { OpenIDCredentialRecordProvider } from '../../src/modules/openid/context/OpenIDCredentialRecordProvider'
import { MockLogger } from '../../src/testing/MockLogger'

// BrandingOverlayType.Branding10 value from @bifold/oca
const BRANDING_OVERLAY_TYPE_10 = 'oca/branding/1.0'

/**
 * Helper to convert snake_case to Title Case
 */
const toTitleCase = (str: string): string => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Mock OCA Bundle Resolver for tests that returns data synchronously.
 * This fixes issues with React 19's async effect handling in tests.
 */
const createMockOCABundleResolver = () => ({
  resolve: jest.fn().mockResolvedValue(undefined),
  resolveDefaultBundle: jest.fn().mockResolvedValue({}),
  presentationFields: jest.fn().mockResolvedValue([]),
  getBrandingOverlayType: jest.fn().mockReturnValue(BRANDING_OVERLAY_TYPE_10),
  resolveAllBundles: jest.fn().mockImplementation((params: { identifiers?: { schemaId?: string }; meta?: { credName?: string; alias?: string } }) => {
    // Extract schema name from schemaId if available (format: "did:2:name:version")
    let credName = params.meta?.credName || 'Credential'
    if (params.identifiers?.schemaId) {
      const parts = params.identifiers.schemaId.split(':')
      if (parts.length >= 3) {
        credName = toTitleCase(parts[2]) // e.g., "unverified_person" -> "Unverified Person"
      }
    }
    return Promise.resolve({
      bundle: {
        captureBase: { attributes: {}, classification: '', flagged_attributes: [] },
        metaOverlay: { name: credName, issuer: params.meta?.alias || 'Unknown Contact' },
        labelOverlay: { attributeLabels: {} },
      },
      presentationFields: [],
      metaOverlay: { name: credName, issuer: params.meta?.alias || 'Unknown Contact' },
      brandingOverlay: { primaryBackgroundColor: '#FFFFFF' },
    })
  }),
})

export const BasicAppContext: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useMemo(() => {
    const c = new MainContainer(container.createChildContainer()).init()
    c.resolve(TOKENS.UTIL_LOGGER)
    c.container.registerInstance(TOKENS.UTIL_LOGGER, new MockLogger())
    // Use mock OCA resolver for faster, more reliable tests
    c.container.registerInstance(TOKENS.UTIL_OCA_RESOLVER, createMockOCABundleResolver())
    return c
  }, [])

  return (
    <ContainerProvider value={context}>
      <OpenIDCredentialRecordProvider>
        <NetworkContext.Provider value={networkContext}>{children}</NetworkContext.Provider>
      </OpenIDCredentialRecordProvider>
    </ContainerProvider>
  )
}

interface CustomBasicAppContextProps extends PropsWithChildren {
  container: Container
}
export const CustomBasicAppContext: React.FC<CustomBasicAppContextProps> = ({ children, container }) => {
  const context = container
  return (
    <ContainerProvider value={context}>
      <NetworkContext.Provider value={networkContext}>{children}</NetworkContext.Provider>
    </ContainerProvider>
  )
}
