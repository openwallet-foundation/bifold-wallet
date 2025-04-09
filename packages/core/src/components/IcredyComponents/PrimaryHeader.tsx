import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, SafeAreaView, FlatList, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NotificationType } from '../listItems/NotificationListItem';
import { useServices, TOKENS } from '../../container-api';
import { useTheme } from '../../contexts/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams, Screens, Stacks } from '../../types/navigators';
import { useTranslation } from 'react-i18next';
import { testIdWithKey } from '../../utils/testable';

const PrimaryHeader = () => {
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const { ColorPallet, TextTheme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const { t } = useTranslation();
  
  const [
    NotificationListItem,
    { customNotificationConfig: customNotification, useNotifications },
    NoNewUpdates,
  ] = useServices([
    TOKENS.NOTIFICATIONS_LIST_ITEM,
    TOKENS.NOTIFICATIONS,
    TOKENS.COMPONENT_HOME_NOTIFICATIONS_EMPTY_LIST,
  ]);

  const notifications = useNotifications({});

  const handleSettingsPress = () => {
    navigation.navigate(Stacks.SettingStack, { screen: Screens.Settings });
  };

  const DisplayListItemType = (item: any): React.ReactNode => {
    let component: React.ReactNode;
    if (item.type === 'BasicMessageRecord') {
      component = <NotificationListItem notificationType={NotificationType.BasicMessage} notification={item} />;
    } else if (item.type === 'CredentialRecord') {
      let notificationType = NotificationType.CredentialOffer;
      if (item.revocationNotification) {
        notificationType = NotificationType.Revocation;
      }
      component = <NotificationListItem notificationType={notificationType} notification={item} />;
    } else if (item.type === 'CustomNotification' && customNotification) {
      component = (
        <NotificationListItem
          notificationType={NotificationType.Custom}
          notification={item}
          customNotification={customNotification}
        />
      );
    } else {
      component = <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />;
    }
    return component;
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={handleSettingsPress}
          accessibilityLabel={t('Screens.Settings')}
          testID={testIdWithKey('Settings')}
        >
          <MaterialIcons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <View>
            <TouchableOpacity 
              onPress={() => setIsNotificationVisible(true)}
              accessibilityLabel={`(${notifications?.length ?? 0})`}
              testID={testIdWithKey('Notifications')}
            >
              <MaterialIcons name="notifications" size={28} color="black" />
              {notifications?.length > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {notifications.length > 99 ? '99+' : notifications.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="person" size={28} color="black" style={styles.profileIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isNotificationVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setIsNotificationVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setIsNotificationVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <FlatList
            style={styles.notificationList}
            data={notifications}
            ListEmptyComponent={NoNewUpdates}
            scrollEnabled={notifications?.length > 0}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: index === 0 ? 20 : 0,
                  paddingBottom: index === notifications.length - 1 ? 20 : 10,
                  backgroundColor: ColorPallet.brand.secondaryBackground,
                }}
              >
                {DisplayListItemType(item)}
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    width: '100%',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    marginLeft: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  notificationList: {
    flex: 1,
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 2,
    textAlign: 'center',
  },
});

export default PrimaryHeader;
