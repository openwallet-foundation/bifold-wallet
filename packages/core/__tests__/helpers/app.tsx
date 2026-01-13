import React, { PropsWithChildren, useMemo } from 'react'
import { NetworkContext } from '../../src/contexts/network'

import networkContext from '../contexts/network'
import { Container, ContainerProvider, TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { container } from 'tsyringe'
import { OpenIDCredentialRecordProvider } from '../../src/modules/openid/context/OpenIDCredentialRecordProvider'
import { MockLogger } from '../../src/testing/MockLogger'
import startCase from 'lodash.startcase'
import { BrandingOverlayType } from '@bifold/oca/build/legacy'

/**
 * Normalizes attribute names for display in tests.
 */
const labelForAttribute = (name: string): string => {
  const normalized = name.replace(/^student_/, '')
  return startCase(normalized)
}

/**
 * Mock OCA Bundle Resolver for tests that returns data synchronously.
 * This fixes issues with React 19's async effect handling in tests.
 */
const createMockOCABundleResolver = () => ({
  resolve: jest.fn().mockResolvedValue(undefined),
  resolveDefaultBundle: jest.fn().mockResolvedValue({}),
  presentationFields: jest.fn().mockImplementation(({ attributes }: { attributes?: any[] }) => {
    return Promise.resolve(attributes ?? [])
  }),
  getBrandingOverlayType: jest.fn().mockReturnValue(BrandingOverlayType.Branding10),
  resolveAllBundles: jest.fn().mockImplementation((params: {
    identifiers?: { schemaId?: string; credentialDefinitionId?: string }
    meta?: { credName?: string; alias?: string }
    attributes?: any[]
  }) => {
    // Extract schema name from schemaId if available (format: "did:2:name:version")
    let credName = params.meta?.credName || 'Credential'
    if (params.identifiers?.schemaId) {
      const schemaId = params.identifiers.schemaId
      // Some verifier templates use a credential definition id in the `schema` field
      if (schemaId.includes(':3:CL:')) {
        const lastSegment = schemaId.split(':').pop() ?? schemaId
        const trimmed = lastSegment.replace(/(?:\\s+Card|_card)$/i, '')
        credName = startCase(trimmed)
      } else {
        const parts = schemaId.split(':')
        if (parts.length >= 3) {
          credName = startCase(parts[2]) // e.g., "unverified_person" -> "Unverified Person"
        }
      }
    } else if (params.identifiers?.credentialDefinitionId) {
      const lastSegment = params.identifiers.credentialDefinitionId.split(':').pop()
      if (lastSegment) {
        credName = startCase(lastSegment)
      }
    }

    const presentationFields = [...(params.attributes ?? [])]

    const attributeLabels = (params.attributes ?? []).reduce<Record<string, string>>((prev, field) => {
      if (!field?.name) return prev
      return { ...prev, [field.name]: labelForAttribute(field.name) }
    }, {})

    const attributes = (params.attributes ?? []).map((field) => ({
      name: field?.name,
      format: field?.format,
    }))

    const shouldApplyKnownBranding =
      params.identifiers?.schemaId?.includes('unverified_person') ||
      params.identifiers?.credentialDefinitionId?.includes('unverified_person')

    return Promise.resolve({
      bundle: {
        captureBase: { attributes: {}, classification: '', flaggedAttributes: [], flagged_attributes: [] },
        metaOverlay: { name: credName, issuer: params.meta?.alias || 'Unknown Contact' },
        labelOverlay: { attributeLabels },
        attributes,
        flaggedAttributes: [],
        metadata: {
          issuerUrl: { en: 'http://example.com/issue' },
          credentialSupportUrl: { en: 'http://example.com/help' },
        },
      },
      presentationFields,
      metaOverlay: { name: credName, issuer: params.meta?.alias || 'Unknown Contact' },
      brandingOverlay: shouldApplyKnownBranding ? { primaryBackgroundColor: '#6c4637' } : {},
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
  const context = useMemo(() => {
    // Align custom containers with the default test container setup
    container.resolve(TOKENS.UTIL_LOGGER)
    container.container.registerInstance(TOKENS.UTIL_LOGGER, new MockLogger())
    container.container.registerInstance(TOKENS.UTIL_OCA_RESOLVER, createMockOCABundleResolver())
    return container
  }, [container])
  return (
    <ContainerProvider value={context}>
      <OpenIDCredentialRecordProvider>
        <NetworkContext.Provider value={networkContext}>{children}</NetworkContext.Provider>
      </OpenIDCredentialRecordProvider>
    </ContainerProvider>
  )
}
