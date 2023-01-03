import { useConnectionById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import RecordRemove from '../components/record/RecordRemove'
import { dateFormatOptions } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { ContactStackParams, Screens } from '../types/navigators'
import { Attribute } from '../types/record'
import { RemoveType } from '../types/remove'

type ContactDetailsProps = StackScreenProps<ContactStackParams, Screens.ContactDetails>

const ContactDetails: React.FC<ContactDetailsProps> = ({ route }) => {
  const { connectionId } = route?.params
  const { t, i18n } = useTranslation()
  const [isDeleteModalDisplayed, setIsDeleteModalDisplayed] = useState<boolean>(false)
  const connection = useConnectionById(connectionId)
  const { record } = useConfiguration()

  const handleOnRemove = () => {
    setIsDeleteModalDisplayed(true)
  }

  const handleSubmitRemove = async () => {
    // TODO
  }

  const handleCancelRemove = () => {
    setIsDeleteModalDisplayed(false)
  }

  const callOnRemove = useCallback(() => handleOnRemove(), [])
  const callSubmitRemove = useCallback(() => handleSubmitRemove(), [])
  const callCancelRemove = useCallback(() => handleCancelRemove(), [])

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      {record({
        fields: [
          {
            name: connection?.alias || connection?.theirLabel,
            value: t('ContactDetails.DateOfConnection', {
              date: connection?.createdAt.toLocaleString(i18n.language, dateFormatOptions),
            }),
          },
        ] as Attribute[],
        footer: () => <RecordRemove onRemove={callOnRemove} />,
      })}
      <CommonRemoveModal
        removeType={RemoveType.Contact}
        visible={isDeleteModalDisplayed}
        onSubmit={callSubmitRemove}
        onCancel={callCancelRemove}
      ></CommonRemoveModal>
    </SafeAreaView>
  )
}

export default ContactDetails
