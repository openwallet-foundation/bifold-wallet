import type { ContactStackParams } from 'navigators/ContactStack'

import { useConnectionById } from '@aries-framework/react-hooks'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaScrollView, Label } from 'components'
import React, { useEffect } from 'react'
import CouponCard from 'components/listItems/CouponCard'

interface Props {
  navigation: StackNavigationProp<ContactStackParams, 'Contact Details'>
  route: RouteProp<ContactStackParams, 'Contact Details'>
}

const ContactDetails: React.FC<Props> = ({ navigation, route, params }) => {
  const connection = useConnectionById(route?.params?.connectionId)

  useEffect(() => {
    navigation.setOptions({
      title: connection?.alias,
    })
  }, [])

  return (
    <SafeAreaScrollView>
      <CouponCard num={7} name={'Burger King'} />
      <Label title="Created" subtitle={JSON.stringify(connection?.createdAt)} />
      <Label title="Latest Coupon" subtitle={'2021-11-28'} />
      <Label title="Reward Spent" subtitle={connection?.state} />
    </SafeAreaScrollView>
  )
}

export default ContactDetails
