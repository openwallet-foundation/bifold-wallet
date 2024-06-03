import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import { InfoBoxType } from '../misc/InfoBox'
import { GenericFn } from '../../types/fn'

import PopupModal from './PopupModal'

interface InviteInfoModalProps {
  onSubmit?: GenericFn
  visible: boolean
}

const InviteInfoModal: React.FC<InviteInfoModalProps> = ({ visible, onSubmit = () => null }) => {
  const { t } = useTranslation()

  return (
    <>
      {visible && (
        <SafeAreaView>
          <PopupModal
            notificationType={InfoBoxType.Info}
            title={'Invite'}
            description={'You received an invitation to connect.'}
            onCallToActionLabel={t('Global.View')}
            onCallToActionPressed={() => onSubmit()}
          ></PopupModal>
        </SafeAreaView>
      )}
    </>
  )
}

export default InviteInfoModal
