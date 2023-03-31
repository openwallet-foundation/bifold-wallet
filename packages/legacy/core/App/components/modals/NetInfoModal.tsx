import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import { InfoBoxType } from '../../components/misc/InfoBox'
import { GenericFn } from '../../types/fn'

import PopupModal from './PopupModal'

interface NetInfoModalProps {
  onSubmit?: GenericFn
  visible: boolean
}

const NetInfoModal: React.FC<NetInfoModalProps> = ({ visible, onSubmit = () => null }) => {
  const { t } = useTranslation()

  return (
    <>
      {visible && (
        <SafeAreaView>
          <PopupModal
            notificationType={InfoBoxType.Error}
            title={t('NetInfo.NoInternetConnectionTitle')}
            description={t('NetInfo.NoInternetConnectionMessage')}
            onCallToActionLabel={t('Global.Okay')}
            onCallToActionPressed={() => onSubmit()}
          ></PopupModal>
        </SafeAreaView>
      )}
    </>
  )
}

export default NetInfoModal
