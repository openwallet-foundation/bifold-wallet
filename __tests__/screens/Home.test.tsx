import { cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { FlatList, Text } from 'react-native'
import TestRenderer from 'react-test-renderer'

import ModularView from '../../App/components/views/ModularView'
import Home from '../../App/screens/Home'

jest.mock('@aries-framework/react-hooks', () => ({
  useCredentialByState: () => [],
  useProofByState: () => [],
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: jest.fn((key: string) => key),
  }),
}))

describe('displays a home screen', () => {
  afterEach(() => {
    cleanup()
  })

  describe('with a notifications module', () => {
    it('is not null', () => {
      const testRenderer = TestRenderer.create(<Home />)
      const rootInstance = testRenderer.root
      const modularViewInstance = rootInstance.findByType(ModularView)

      expect(modularViewInstance).not.toBeNull()
    })

    it('has a title', () => {
      const testRenderer = TestRenderer.create(<Home />)
      const rootInstance = testRenderer.root
      const modularViewInstance = rootInstance.findByType(ModularView)

      expect(modularViewInstance.props.title).toBe('Home.Notifications')
    })

    it('has no items by default', () => {
      const testRenderer = TestRenderer.create(<Home />)
      const rootInstance = testRenderer.root
      const modularViewInstance = rootInstance.findByType(ModularView)
      const flatListInstance = modularViewInstance.findByType(FlatList)

      expect(flatListInstance.findByType(Text).props.children).toBe('Home.NoNewUpdates')
    })
  })
})
