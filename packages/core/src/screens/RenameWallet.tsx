import { useAgent } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import React, { useCallback } from 'react'

import WalletNameForm from '../components/forms/WalletNameForm'

const RenameWallet: React.FC = () => {
  const navigation = useNavigation()
  const { agent } = useAgent()

  const onCancel = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const onSubmitSuccess = useCallback(
    (name: string) => {
      agent.config.label = name
      navigation.goBack()
    },
    [navigation, agent]
  )

  return <WalletNameForm isRenaming onCancel={onCancel} onSubmitSuccess={onSubmitSuccess} />
}

export default RenameWallet
