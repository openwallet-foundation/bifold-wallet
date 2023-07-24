import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import { ChatMessage, CallbackType } from '../../App/components/chat/ChatMessage'
import { testIdWithKey } from '../../App/utils/testable'

const onDetailsMock = jest.fn()
const user = {
  _id: 'me',
}
const currentMessage = {
  _id: '1',
  user,
  messageOpensCallbackType: CallbackType.CredentialOffer,
  onDetails: onDetailsMock,
  renderEvent: jest.fn(),
}
const props = {
  user,
  currentMessage,
}

describe('ChatMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Credential offer renders correctly', () => {
    props.currentMessage.messageOpensCallbackType = CallbackType.CredentialOffer
    // @ts-ignore
    const tree = render(<ChatMessage messageProps={props} />)
    const button = tree.getByTestId(testIdWithKey('Chat.ViewOffer'))

    fireEvent(button, 'press')

    expect(onDetailsMock).toHaveBeenCalledTimes(1)
    expect(button).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })

  test('Proof request renders correctly', () => {
    props.currentMessage.messageOpensCallbackType = CallbackType.ProofRequest
    // @ts-ignore
    const tree = render(<ChatMessage messageProps={props} />)
    const button = tree.getByTestId(testIdWithKey('Chat.ViewRequest'))

    fireEvent(button, 'press')

    expect(onDetailsMock).toHaveBeenCalledTimes(1)
    expect(button).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })

  test('Sent presentation renders correctly', () => {
    props.currentMessage.messageOpensCallbackType = CallbackType.PresentationSent
    // @ts-ignore
    const tree = render(<ChatMessage messageProps={props} />)
    const button = tree.getByTestId(testIdWithKey('Chat.OpenPresentation'))

    fireEvent(button, 'press')

    expect(onDetailsMock).toHaveBeenCalledTimes(1)
    expect(button).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })
})
