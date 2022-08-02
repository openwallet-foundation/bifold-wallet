import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, SafeAreaView } from 'react-native'

import InfoBox, { InfoBoxType } from '../../components/misc/InfoBox'
import { GenericFn } from '../../types/fn'

interface NetInfoModalProps {
  onSubmit?: GenericFn
  visible: boolean
}

const NetInfoModal: React.FC<NetInfoModalProps> = ({ visible, onSubmit = () => null }) => {
  const { t } = useTranslation()

  return (
    <Modal visible={visible} transparent={true}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <InfoBox
          notificationType={InfoBoxType.Error}
          title={t('NetInfo.NoInternetConnectionTitle')}
          description={t('NetInfo.NoInternetConnectionMessage')}
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={() => onSubmit()}
        />
      </SafeAreaView>
    </Modal>
  )
}

export default NetInfoModal
