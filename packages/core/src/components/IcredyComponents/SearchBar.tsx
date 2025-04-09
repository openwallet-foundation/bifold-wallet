import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { ColorPallet, TextTheme } from '../../theme'

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  width: number;
  height: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, value, onChangeText, width, height }) => {
  return (
    <TextInput
      style={[
        styles.searchBar,
        {
          marginHorizontal: width * 0.05,
          paddingVertical: height * 0.02,
          borderRadius: height * 0.02,
        },
      ]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    ...TextTheme.normal,
    color: ColorPallet.grayscale.mediumGrey,
    paddingHorizontal: 15,
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
});

export default SearchBar;
