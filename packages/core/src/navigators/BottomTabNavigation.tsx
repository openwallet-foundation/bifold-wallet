import React from 'react';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HomeStack from './HomeStack';
// import ConnectionsStack from './ConnectionsStack';
// import MessagesStack from './MessagesStack';

type BottomTabParamList = {
  Home: undefined;
  // Connections: undefined;
  Connections: { oobRecordId: string };
  Messages: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigation: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: '#154ABF' },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#000000',
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: 'home' | 'link' | 'message' | undefined;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Connections') {
            iconName = 'link';
          } else if (route.name === 'Messages') {
            iconName = 'message';
          }

          if (!iconName) {
            // Provide a fallback icon name in case something goes wrong
            iconName = 'home'; // default fallback icon
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      {/* <Tab.Screen name="Connections" component={ConnectionsStack} />
      <Tab.Screen name="Messages" component={MessagesStack} /> */}
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
