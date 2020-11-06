import React, {useContext} from 'react'
import { Text } from 'react-native'

import {NotificationsContext} from './Notifications.js'

function LoadingOverlay (props) {
	const notifications = useContext(NotificationsContext)
	notifications.setVisible(true);
	notifications.setText("Notification!");
	return (
		<Text> LoadingOverlay! </Text>
	)
}

export default LoadingOverlay