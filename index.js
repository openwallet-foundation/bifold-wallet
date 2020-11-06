/**
 * @format
 */

import {AppRegistry} from 'react-native';
import React from 'react';
import {NativeRouter} from 'react-router-native'
import App from './App';
import {name as appName} from './app.json';

const Base = (props) => (
	<NativeRouter>
		<App />
	</NativeRouter>
)

AppRegistry.registerComponent(appName, () => Base);
