import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useWindowDimensions, SafeAreaView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ColorPallet, TextTheme } from '../theme'
import { StackScreenProps } from '@react-navigation/stack';
import { HomeStackParams, Screens } from '../types/navigators';
import { PrimaryHeader } from '../components/IcredyComponents';


// Define the type for the options array
interface Option {
  id: string;
  title: string;
  navigateTo: string | null;
}

type HomeProps = StackScreenProps<HomeStackParams, Screens.HomeScreen>
const HomeScreen: React.FC<HomeProps> = () => {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp<any>>();

  const options: Option[] = [
    { id: '1', title: 'Request Credentials', navigateTo: Screens.RequestCredential },
    { id: '2', title: 'Verifier', navigateTo: Screens.CredentialProof },

  ];

  const renderItem = ({ item }: { item: Option }) => (
    <TouchableOpacity
      style={[styles.button, { width: width * 0.8 }]}
      onPress={() => {
        if (item.navigateTo) {
          navigation.navigate(item.navigateTo);
        }
      }}
    >
      <Text style={styles.buttonText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PrimaryHeader />
      <View style={[styles.content, { paddingHorizontal: width * 0.09, marginTop: height * 0.2 }]}>
        <Text style={[styles.header, { marginLeft: width * 0.02 }]}>QUICK OPTIONS</Text>
        <FlatList
          data={options}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  content: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    ...TextTheme.headingFour,
    color: ColorPallet.grayscale.black,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  list: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: ColorPallet.brand.primary,
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    ...TextTheme.bold,
    color: ColorPallet.grayscale.white,
  },
});

export default HomeScreen;
