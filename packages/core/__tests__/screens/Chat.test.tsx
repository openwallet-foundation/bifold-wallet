import { useBasicMessagesByConnectionId, useConnectionById } from '@bifold/react-hooks'
import { 
  DidCommBasicMessageRecord,
  DidCommBasicMessageRole,
  DidCommConnectionRecord,
  DidCommDidExchangeRole,
  DidCommDidExchangeState
} from '@credo-ts/didcomm'
import { render } from '@testing-library/react-native'
import React from 'react'

import * as network from '../../src/contexts/network'
import Chat from '../../src/screens/Chat'
import { BasicMessageMetadata } from '../../src/types/metadata'
import navigationContext from '../contexts/navigation'
import { BasicAppContext } from '../helpers/app'

jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: jest.fn(() => 100),
}))

const props = { params: { connectionId: '1' } }

const connection = new DidCommConnectionRecord({
  id: '1',
  createdAt: new Date(2024, 1, 1),
  state: DidCommDidExchangeState.Completed,
  role: DidCommDidExchangeRole.Requester,
  theirDid: 'did:example:123',
  theirLabel: 'Alice',
})

const unseenMessage = new DidCommBasicMessageRecord({
  threadId: '1',
  connectionId: '1',
  role: DidCommBasicMessageRole.Receiver,
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

const seenMessage = new DidCommBasicMessageRecord({
  threadId: '2',
  connectionId: '1',
  role: DidCommBasicMessageRole.Receiver,
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

const testBasicMessages: DidCommBasicMessageRecord[] = [unseenMessage, seenMessage]

describe('Chat Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-expect-error useConnectionById will be replaced with a mock which will have this method
    useConnectionById.mockReturnValue(connection)
    // @ts-expect-error useBasicMessagesByConnectionId will be replaced with a mock which will have this method
    useBasicMessagesByConnectionId.mockReturnValue(testBasicMessages)
  })

  test('Renders correctly', async () => {
    jest.spyOn(network, 'useNetwork').mockImplementation(() => ({
      silentAssertConnectedNetwork: () => true,
      assertNetworkConnected: () => true,
      assertInternetReachable: jest.fn(),
      assertMediatorReachable: jest.fn(),
      displayNetInfoModal: jest.fn(),
      hideNetInfoModal: jest.fn(),
    }))
    const element = (
      <BasicAppContext>
        <Chat navigation={navigationContext} route={props as any} />
      </BasicAppContext>
    )
    const tree = render(element)

    expect(tree).toMatchSnapshot()
  })
})

describe('Chat screen with messages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-expect-error useConnectionById will be replaced with a mock which will have this method
    useConnectionById.mockReturnValue(connection)
    // @ts-expect-error useBasicMessagesByConnectionId will be replaced with a mock which will have this method
    useBasicMessagesByConnectionId.mockReturnValue(testBasicMessages)
    jest.spyOn(network, 'useNetwork').mockImplementation(() => ({
      silentAssertConnectedNetwork: () => true,
      assertNetworkConnected: () => true,
      assertInternetReachable: jest.fn(),
      assertMediatorReachable: jest.fn(),
      displayNetInfoModal: jest.fn(),
      hideNetInfoModal: jest.fn(),
    }))
  })

  test('Marks messages as seen', async () => {
    render(
      <BasicAppContext>
        <Chat navigation={navigationContext} route={props as any} />
      </BasicAppContext>
    )

    expect(unseenMessage.metadata.set).toBeCalled()
    expect(seenMessage.metadata.set).not.toBeCalled()
  })
})
