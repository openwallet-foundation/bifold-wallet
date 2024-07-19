import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { StoreProvider, defaultState } from '../../App/contexts/store'
import { ContainerProvider } from '../../App/container-api'
import PasteUrl from '../../App/screens/PasteUrl'
import { useNavigation } from '@react-navigation/native'
import { MainContainer } from '../../App/container-impl'
import { container } from 'tsyringe'
import { testIdWithKey } from '../../App/utils/testable'
import { useTranslation } from 'react-i18next'

jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('../../App/contexts/configuration', () => ({
  useConfiguration: jest.fn().mockReturnValue({ enableImplicitInvitations: true, enableReuseConnections: true }),
}))

const { t } = useTranslation()

describe('displays a paste url screen', () => {
  test('Paste URL renders correctly', () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
            preferences: { ...defaultState.preferences, enableShareableLink: true },
          }}
        >
          <PasteUrl navigation={useNavigation()} route={{} as any} />
        </StoreProvider>
      </ContainerProvider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Test Error textbox empty messages', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
            preferences: { ...defaultState.preferences, enableShareableLink: true },
          }}
        >
          <PasteUrl navigation={useNavigation()} route={{} as any} />
        </StoreProvider>
      </ContainerProvider>
    )
    const touchableDisabled = tree.getByTestId(testIdWithKey('ScanPastedUrlDisabled'))
    expect(touchableDisabled).not.toBeNull()
    fireEvent.press(touchableDisabled, 'press')

    const errorModal = await tree.findByText(t('PasteUrl.ErrorTextboxEmpty'))
    expect(errorModal).not.toBeNull()
  })

  test('Test Error textbox invalid url messages', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
            preferences: { ...defaultState.preferences, enableShareableLink: true },
          }}
        >
          <PasteUrl navigation={useNavigation()} route={{} as any} />
        </StoreProvider>
      </ContainerProvider>
    )
    const textbox = tree.getByTestId(testIdWithKey('PastedUrl'))
    expect(textbox).not.toBeNull()
    textbox.props.onChangeText('didcom://invalid_url?c_i=hjhsdb')

    const continueButton = tree.getByTestId(testIdWithKey('ScanPastedUrl'))
    expect(continueButton).not.toBeNull()
    fireEvent.press(continueButton, 'press')

    const errorModal = await tree.findByText(t('PasteUrl.ErrorInvalidUrl'))
    expect(errorModal).not.toBeNull()
  })

  test('Test valid url navigation', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const navigation = { navigate: jest.fn(), getParent: jest.fn().mockReturnValue({ navigate: jest.fn() }) }
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
            preferences: { ...defaultState.preferences, enableShareableLink: true },
          }}
        >
          <PasteUrl navigation={navigation as any} route={{} as any} />
        </StoreProvider>
      </ContainerProvider>
    )
    const textbox = tree.getByTestId(testIdWithKey('PastedUrl'))
    expect(textbox).not.toBeNull()
    textbox.props.onChangeText(
      'didcomm://invite?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiJlNGVlZjBjYS05ODZiLTRlZDUtODcyNi1jZmRhN2ZhMWIwYWMiLCJsYWJlbCI6Ik15IFdhbGxldCAtIDIwNjgiLCJhY2NlcHQiOlsiZGlkY29tbS9haXAxIiwiZGlkY29tbS9haXAyO2Vudj1yZmMxOSJdLCJoYW5kc2hha2VfcHJvdG9jb2xzIjpbImh0dHBzOi8vZGlkY29tbS5vcmcvZGlkZXhjaGFuZ2UvMS4xIiwiaHR0cHM6Ly9kaWRjb21tLm9yZy9jb25uZWN0aW9ucy8xLjAiXSwic2VydmljZXMiOlt7ImlkIjoiI2lubGluZS0wIiwic2VydmljZUVuZHBvaW50IjoiaHR0cHM6Ly9hcmllcy1tZWRpYXRvci1hZ2VudC10ZXN0LmFwcHMuc2lsdmVyLmRldm9wcy5nb3YuYmMuY2EiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa3RORHppdWk3S2tNYVhkNjRlczVWNzc5OUxaNXdqRktDcVNRNHYzck16UXB5Il0sInJvdXRpbmdLZXlzIjpbImRpZDprZXk6ejZNa2lGV0dXeXZQUldkRnZIaXlyZjU5R3l4ZFY0Q0toYmtzQ1hvOEpraHJnNUgyIl19XX0'
    )

    const continueButton = tree.getByTestId(testIdWithKey('ScanPastedUrl'))
    expect(continueButton).not.toBeNull()
    fireEvent.press(continueButton, 'press')

    const errorModal = tree.queryByText(t('PasteUrl.ErrorInvalidUrl'))
    expect(errorModal).toBeNull()
  })
})
