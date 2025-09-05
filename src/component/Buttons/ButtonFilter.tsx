import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface RowButtonProps {
  id: string | number;
  label: string;
  value: any;
  color?: string;
  focusColor?: string;
  textColor?: string;
  focusTextColor?: string;
  onPress: (value: any) => void;
}

interface RowButtonGroupProps {
  buttons: RowButtonProps[];
  defaultSelected?: string | number;
  style?: any;
  buttonStyle?: any;
  gap?: number;
  scrollable?: boolean;
  textStyle?: any
}

const RowButtonGroup: React.FC<RowButtonGroupProps> = ({
  buttons,
  defaultSelected,
  style,
  buttonStyle,
  gap = 8,
  textStyle,
  scrollable = false
}) => {
  const [selectedId, setSelectedId] = useState<string | number | null>(
    defaultSelected || (buttons.length > 0 ? buttons[0].id : null)
  );

  const handlePress = (button: RowButtonProps) => {
    setSelectedId(button.id);
    button.onPress(button.value);
  };

  const renderButton = (button: RowButtonProps, index: number) => {
    const isSelected = selectedId === button.id;
    
    const buttonStyles = [
      styles.button,
      buttonStyle,
      {
        backgroundColor: isSelected 
          ? (button.focusColor || '#1A736A') 
          : (button.color || '#f0f0f0'),
        marginRight: index < buttons.length - 1 ? gap : 0,
      }
    ];

    const textStyles = [
      styles.buttonText,
      textStyle,
      {
        color: isSelected 
          ? (button.focusTextColor || '#ffffff') 
          : (button.textColor || '#666666'),
        fontWeight: isSelected ? '600' : '400',
      }
    ];

    return (
      <TouchableOpacity
        key={button.id}
        style={buttonStyles}
        onPress={() => handlePress(button)}
        activeOpacity={0.7}
      >
        <Text style={textStyles}>{button.label}</Text>
      </TouchableOpacity>
    );
  };

  if (scrollable) {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.container, style]}
        contentContainerStyle={[
          styles.scrollContent, 
          {
            alignItems: 'center',
            justifyContent: 'flex-start',
          }
        ]}
      >
        {buttons.map(renderButton)}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {buttons.map(renderButton)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default RowButtonGroup;