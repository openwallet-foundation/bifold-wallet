import React from 'react'
import { View } from 'react-native'
import { StackHeaderProps, Header } from '@react-navigation/stack'
import { useServices, TOKENS } from '../../container-api'

const HeaderWithBanner: React.FC<StackHeaderProps> = (props) => {
  const [NotificationBanner] = useServices([TOKENS.COMPONENT_NOTIFICATION_BANNER])

  return (
    <View>
      <Header {...props} />
      <NotificationBanner />
    </View>
  )
}

export default HeaderWithBanner
