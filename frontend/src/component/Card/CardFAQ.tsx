// component-v2/Card/CardFAQ.tsx
import { themeStyle } from '@/src/theme';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
};

export default function CardFAQ({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={{
      flexDirection: 'row',
      backgroundColor: themeStyle.colors.white,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 12,
      marginVertical: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 2,
    }} onPress={onPress}>
      <Text style={{fontSize: themeStyle.fontSize.descriptionL, 
        fontFamily: themeStyle.fontFamily.semibold}}>{title}</Text>
      <Text style={{
        fontSize: themeStyle.fontSize.header1, 
        color: themeStyle.colors.black,
        }}>›</Text>
    </TouchableOpacity>
  );
}
