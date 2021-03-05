import React, {useState, useContext} from 'react'
import {Image, Text, TouchableOpacity, View} from 'react-native'

import Images from '../../assets/images'
import AppStyles from '../../assets/styles'
import Styles from './styles'

import {useHistory} from 'react-router-native'

const NotificationsContext = React.createContext({})

interface INotification {
  title: string
  text: string
  image: string
  path: string
}

function Notification(props: INotification) {
  let history = useHistory()

  const notifications = useContext(NotificationsContext)

  return (
    <View style={Styles.msgView}>
      <View style={Styles.innerView}>
        <TouchableOpacity
          onPress={() => {
            notifications.setVisible(false)
            history.push(props.path)
          }}>
          {props.title ? (
            <Text
              style={[
                AppStyles.h2,
                AppStyles.textSecondary,
                AppStyles.textBold,
              ]}>
              {props.title}
              {'\n'}
            </Text>
          ) : null}
          {props.text ? (
            <Text style={AppStyles.textSecondary}>
              {props.text}
              {'\n'}
            </Text>
          ) : null}
          {props.image ? (
            <Image
              source={Images.arrow}
              style={{alignSelf: 'center', width: 60, height: 68}}
            />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  )
}

interface INotifications {
  children: JSX.Element[]
}

function Notifications(props: INotifications) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')
  const [path, setPath] = useState('')
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')

  return (
    <NotificationsContext.Provider
      value={{
        setVisible: setVisible,
        setText: setText,
        setPath: setPath,
        setTitle: setTitle,
        setImage: setImage,
      }}>
      {props.children}
      {visible ? (
        <Notification text={text} path={path} title={title} image={image} />
      ) : null}
    </NotificationsContext.Provider>
  )
}

export default Notifications
export {NotificationsContext}
