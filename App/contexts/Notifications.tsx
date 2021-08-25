import React, { useState, useContext } from 'react'
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import Images from '../../assets/images'

const NotificationsContext = React.createContext({})

interface INotification {
  title: string
  text: string
  image: string
  path: string
}

function Notification(props: INotification) {
  const notifications = useContext<any>(NotificationsContext)

  return (
    <View style={styles.msgView}>
      <View style={styles.innerView}>
        <TouchableOpacity
          onPress={() => {
            notifications.setVisible(false)
          }}
        >
          {props.title ? (
            <Text style={[AppStyles.h2, AppStyles.textSecondary, AppStyles.textBold]}>
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
          {props.image ? <Image source={Images.arrow} style={{ alignSelf: 'center', width: 60, height: 68 }} /> : null}
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
      }}
    >
      {props.children}
      {visible ? <Notification text={text} path={path} title={title} image={image} /> : null}
    </NotificationsContext.Provider>
  )
}

export default Notifications
export { NotificationsContext }

const styles = StyleSheet.create({
  msgView: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.78)',
  },
  innerView: {
    width: '100%',
    height: '83%',
    top: '17%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 50,
  },
})
