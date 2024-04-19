import { BasicMessageRecord, BasicMessageRole } from '@credo-ts/core'
import { useBasicMessagesByConnectionId } from '@credo-ts/react-hooks'
import { render } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import * as network from '../../App/contexts/network'
import Chat from '../../App/screens/Chat'
import { BasicMessageMetadata } from '../../App/types/metadata'
import configurationContext from '../contexts/configuration'
import navigationContext from '../contexts/navigation'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

const props = { params: { connectionId: '1' } }

const unseenMessage = new BasicMessageRecord({
  threadId: '1',
  connectionId: '1',
  role: BasicMessageRole.Receiver,
  content: 'Hello',
  sentTime: '20200303',
})

unseenMessage.metadata = {
  get: jest.fn().mockReturnValue(undefined),
  set: jest.fn(),
  add: jest.fn(),
  delete: jest.fn(),
  keys: [BasicMessageMetadata.customMetadata],
  data: {
    [BasicMessageMetadata.customMetadata]: {
      seen: false,
    },
  },
}

const seenMessage = new BasicMessageRecord({
  threadId: '2',
  connectionId: '1',
  role: BasicMessageRole.Receiver,
  content: 'Hi',
  sentTime: '20200303',
})

seenMessage.metadata = {
  get: jest.fn().mockReturnValue({ seen: true }),
  set: jest.fn(),
  add: jest.fn(),
  delete: jest.fn(),
  keys: [BasicMessageMetadata.customMetadata],
  data: {
    [BasicMessageMetadata.customMetadata]: {
      seen: true,
    },
  },
}

const testBasicMessages: BasicMessageRecord[] = [unseenMessage, seenMessage]

describe('Chat screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    jest.spyOn(network, 'useNetwork').mockImplementation(() => ({
      silentAssertConnectedNetwork: () => true,
      assertConnectedNetwork: () => true,
      assertLedgerConnectivity: jest.fn(),
      displayNetInfoModal: jest.fn(),
      hideNetInfoModal: jest.fn(),
    }))
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <Chat navigation={navigationContext} route={props as any} />
      </ConfigurationContext.Provider>
    )
    const tree = render(element)

    expect(tree).toMatchSnapshot()
  })
})

describe('Chat screen with messages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-ignore
    useBasicMessagesByConnectionId.mockReturnValue(testBasicMessages)
    jest.spyOn(network, 'useNetwork').mockImplementation(() => ({
      silentAssertConnectedNetwork: () => true,
      assertConnectedNetwork: () => true,
      assertLedgerConnectivity: jest.fn(),
      displayNetInfoModal: jest.fn(),
      hideNetInfoModal: jest.fn(),
    }))
  })

  test('Marks messages as seen', async () => {
    render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Chat navigation={navigationContext} route={props as any} />
      </ConfigurationContext.Provider>
    )

    expect(unseenMessage.metadata.set).toBeCalled()
    expect(seenMessage.metadata.set).not.toBeCalled()
  })
})
