import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation, RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SecondaryHeader } from '../components/IcredyComponents';
import { ColorPallet, TextTheme } from '../theme'

// Updated types for navigation
type RootStackParamList = {
  DocumentType: {
    connectionId: string | undefined;
  };
  DocumentOption: {
    connectionId: string | undefined;
  };
  EmployementDocument: {
    connectionId: string | undefined;
  };
  Onfido: {
    connectionId: string | undefined;
  };
  Regula: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'DocumentType'>;

interface DocumentType {
  id: string;
  name: string;
}

const DocumentTypeSelectionScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { connectionId } = route.params;
  const { width, height } = useWindowDimensions();

  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);

  // Reset selection when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // This runs when the screen is focused
      setSelectedDocumentType(null);
      
      // Return a cleanup function (optional)
      return () => {
        // This runs when the screen is unfocused
      };
    }, [])
  );

  const documentTypes: DocumentType[] = [
    { id: '1', name: 'Identity Proof' },
    { id: '2', name: 'Employement Proof' },
  ];

  const handlePress = (item: DocumentType) => {
    if(!connectionId){
      return;
    }
    
    setSelectedDocumentType(item.id);

    if (item.name === 'Employement Proof') {
      navigation.navigate('EmployementDocument', { connectionId });
    } else if (item.name === 'Identity Proof') {
      navigation.navigate('Onfido', { connectionId });
    }
  };

  const renderItem = ({ item }: { item: DocumentType }) => (
    <View>
      <View style={[styles.itemContainer, { paddingHorizontal: width * 0.05 }]}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => handlePress(item)}
        >
          <View
            style={[
              styles.radioOuterCircle,
              selectedDocumentType === item.id && styles.radioSelected,
            ]}
          >
            {selectedDocumentType === item.id && (
              <View style={styles.radioInnerCircle} />
            )}
          </View>
        </TouchableOpacity>
        <Text style={[styles.documentTypeName, { width: width * 0.4 }]}>
          {item.name}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader />

      <View style={[styles.header, { paddingHorizontal: width * 0.05, marginTop: height * 0.09 }]}>
        <Text style={styles.headerText}>Request for Credential</Text>
      </View>
      <Text style={[styles.subHeader, { marginHorizontal: width * 0.05 }]}>
        List of documents issued by the organization
      </Text>

      <FlatList
        data={documentTypes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  header: {
    marginVertical: 20,
  },
  headerText: {
    ...TextTheme.headingFour,
    color: ColorPallet.brand.text,
    textAlign: 'center',
  },
  subHeader: {
    marginVertical: 12,
    ...TextTheme.normal,
    color: ColorPallet.brand.text,
  },
  listContainer: {
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioButton: {
    marginRight: 10,
  },
  radioOuterCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ColorPallet.grayscale.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: ColorPallet.grayscale.black,
  },
  radioSelected: {
    borderColor: ColorPallet.grayscale.black,
  },
  documentTypeName: {
    ...TextTheme.normal,
    color: ColorPallet.brand.text,
  },
});

export default DocumentTypeSelectionScreen;