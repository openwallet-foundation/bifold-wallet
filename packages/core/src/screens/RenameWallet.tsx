import { useNavigation } from '@react-navigation/native'
import React, { useCallback } from 'react'

import WalletNameForm from '../components/forms/WalletNameForm'

const RenameWallet: React.FC = () => {
  const navigation = useNavigation()

  const onCancel = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const onSubmitSuccess = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_: string) => {
      // TODO: We can't assign to this label anymore, do we want to do anything with this argument still?
      // agent.config.label = name
      navigation.goBack()
    },
    [navigation]
  )

  return <WalletNameForm isRenaming onCancel={onCancel} onSubmitSuccess={onSubmitSuccess} />
}

export default RenameWallet
