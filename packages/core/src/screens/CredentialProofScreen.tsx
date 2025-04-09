import React from "react";
import { 
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList 
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { SecondaryHeader } from "../components/IcredyComponents";
import { Screens, Stacks } from '../types/navigators';
import { ColorPallet, TextTheme } from '../theme'

interface DocumentItem {
    id: string;
    name: string;
}

const CredentialProof = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    
    const handleDocumentPress = () => {
        navigation.getParent()?.navigate(Stacks.ProofRequestsStack, {
            screen: Screens.ProofRequests,
        });
    };

    const documents: DocumentItem[] = [
        { id: '1', name: 'Driving License' },
        { id: '2', name: 'Employment Proof' }
    ];

    const renderItem = ({ item }: { item: DocumentItem }) => (
        <TouchableOpacity 
            style={styles.documentOption} 
            onPress={handleDocumentPress}
        >
            <Text style={styles.documentText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <SecondaryHeader />
            <View style={styles.mainContainer}>
                <Text style={styles.heading}>Select Document</Text>
                
                <FlatList
                    data={documents}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: ColorPallet.brand.primaryBackground,
    },
    mainContainer: {
        flex: 1,
        padding: 16
    },
    listContainer: {
        paddingBottom: 16
    },
    heading: {
         marginBottom: 20,
        ...TextTheme.headingFour,
        color: ColorPallet.brand.text,
    },
    documentOption: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: ColorPallet.brand.secondaryBackground
    },
    documentText: {
        ...TextTheme.normal,
        color: ColorPallet.brand.text,
    }
});

export default CredentialProof;