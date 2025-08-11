import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SensorCenterHeaderProps {
  onBackPress?: () => void;
}

const SensorCenterHeader: React.FC<SensorCenterHeaderProps> = ({ onBackPress }) => {
  return (
    <View style={{
      backgroundColor: 'white',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 48, // Account for status bar
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    }}>
      <TouchableOpacity onPress={onBackPress} style={{ marginRight: 16 }}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        textAlign: 'center',
        marginRight: 40, // Balance the back button
      }}>
        Sensor Center
      </Text>
    </View>
  );
};

export default SensorCenterHeader;
