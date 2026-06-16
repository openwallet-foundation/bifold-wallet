import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { OpenIDNotificationCard } from '../../../src/modules/openid/features/notifications/OpenIDNotificationCard'
import { OpenIDNotificationData } from '../../../src/modules/openid/features/notifications/types'
import { jest, describe, expect, test, beforeEach } from "@jest/globals"
import { testIdWithKey } from '../../../src/utils/testable'

// --- Mocks ---

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}))

jest.mock('moment', () => {
  const moment = () => ({ format: () => '01 January 2024' })
  return moment
})

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

jest.mock('../../../src/contexts/theme', () => ({
  useTheme: () => ({
    TextTheme: { caption: {}, title: {} },
    ListItems: { recordLink: {} },
    ColorPalette: { brand: { headerIcon: '#000' } },
  }),
}))

jest.mock('../../../src/modules/openid/features/notifications/components/NotificationCardIcon', () => ({
  NotificationCardIcon: 'NotificationCardIcon',
}))

jest.mock('../../../src/modules/openid/context/OpenIDCredentialRecordProvider', () => ({
  useOpenIDCredentials: () => ({ getCredentialById: () => ({ id: '1234' }) }),
}))

jest.mock('../../../src/modules/openid/display', () => ({
  getCredentialForDisplay: () => ({ display: { id: '1234', name: 'Test Credential' } }),
}))

const mockOnPressAction = jest.fn()
const mockOnCloseAction = jest.fn()

// --- Helpers --- //

const baseNotification: OpenIDNotificationData = {
  metadata: { oldId: '1234' },
  createdAt: new Date('2024-01-01'),
  onPressAction: mockOnPressAction,
  onCloseAction: mockOnCloseAction,
}

const improperNotification: OpenIDNotificationData = {
  metadata: {},
  createdAt: new Date('2024-01-01'),
  onPressAction: mockOnPressAction,
  onCloseAction: mockOnCloseAction,
}

function renderCard(
  type: 'CredentialRefresh' | 'CredentialExpired' = 'CredentialRefresh',
  notification: OpenIDNotificationData = baseNotification
) {
  return render(
      <OpenIDNotificationCard notification={notification} type={type} />
  )
}

// --- Tests ---

describe('OpenIDNotificationCard', () => {

  describe('Credential Refresh', () => {

    test('Renders correctly for credential refresh scenario', async () => {
      const tree = renderCard()
      expect(tree).toMatchSnapshot()
    })

    test('Displays the correctly formatted date', async () => {
      const { findByText } = renderCard()
      const dateText = await findByText('01 January 2024')
      expect(dateText).toBeTruthy()
    })

    test('Displays the credential name', async () => {
      const { findByText } = renderCard()
      const titleText = await findByText('OpenIDNotification.CredentialRefresh.Title:{"cardName":"Test Credential"}')
      expect(titleText).toBeTruthy()
    })

    test('Returns nothing when given improper notification data', async () => {
      const { toJSON } = renderCard("CredentialRefresh", improperNotification)
      expect(toJSON()).toBeNull()
    })

    test('Fires correct action on notification press', async () => {
      const { findByTestId } = renderCard("CredentialRefresh", baseNotification)
      const pressable = await findByTestId(testIdWithKey('OpenIDNotificationPressable'))
      fireEvent(pressable, 'press')
      expect(baseNotification.onPressAction).toHaveBeenCalledTimes(1)
    })

  })

  describe('Credential Expired', () => {

    test('Renders correctly for credential expired scenario', async () => {
      const tree = renderCard("CredentialExpired", baseNotification)
      expect(tree).toMatchSnapshot()
    })

    test('Displays the correctly formatted date', async () => {
      const { findByText } = renderCard("CredentialExpired", baseNotification)
      const dateText = await findByText('01 January 2024')
      expect(dateText).toBeTruthy()
    })

    test('Displays the credential name', async () => {
      const { findByText } = renderCard("CredentialExpired", baseNotification)
      const titleText = await findByText('OpenIDNotification.CredentialExpired.Title:{"cardName":"Test Credential"}')
      expect(titleText).toBeTruthy()
    })

    test('Displays the x button to the user and fires the correct action on press', async () => {
      const { findByTestId } = renderCard("CredentialExpired", baseNotification)
      const xButton = await findByTestId(testIdWithKey('OpenIDNotificationXButton'))
      fireEvent(xButton, 'press')
      expect(baseNotification.onCloseAction).toHaveBeenCalledTimes(1)
    })

  })

})
