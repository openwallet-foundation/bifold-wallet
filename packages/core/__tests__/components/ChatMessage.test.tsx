import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'
import { MessageProps } from 'react-native-gifted-chat'

import { ChatMessage, CallbackType, ExtendedChatMessage } from '../../src/components/chat/ChatMessage'
import { Role } from '../../src/types/chat'
import { testIdWithKey } from '../../src/utils/testable'

const onDetailsMock = jest.fn()
const user = {
  _id: Role.me,
}
const currentMessage: ExtendedChatMessage = {
  _id: '1',
  user,
  messageOpensCallbackType: CallbackType.CredentialOffer,
  onDetails: onDetailsMock,
  renderEvent: jest.fn(),
  text: 'test',
  createdAt: new Date('2024-01-01'),
}
const props: MessageProps<ExtendedChatMessage> = {
  user,
  currentMessage: currentMessage,
  key: '1',
  position: 'left',
}

describe('ChatMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Credential offer renders correctly', () => {
    props.currentMessage!.messageOpensCallbackType = CallbackType.CredentialOffer
    const tree = render(<ChatMessage messageProps={props} />)
    const button = tree.getByTestId(testIdWithKey('Chat.ViewOffer'))

    fireEvent(button, 'press')

    expect(onDetailsMock).toHaveBeenCalledTimes(1)
    expect(button).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })

  test('Proof request renders correctly', () => {
    props.currentMessage!.messageOpensCallbackType = CallbackType.ProofRequest
    const tree = render(<ChatMessage messageProps={props} />)
    const button = tree.getByTestId(testIdWithKey('Chat.ViewRequest'))

    fireEvent(button, 'press')

    expect(onDetailsMock).toHaveBeenCalledTimes(1)
    expect(button).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })

  test('Sent presentation renders correctly', () => {
    props.currentMessage!.messageOpensCallbackType = CallbackType.PresentationSent
    const tree = render(<ChatMessage messageProps={props} />)
    const button = tree.getByTestId(testIdWithKey('Chat.OpenPresentation'))

    fireEvent(button, 'press')

    expect(onDetailsMock).toHaveBeenCalledTimes(1)
    expect(button).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })
})
