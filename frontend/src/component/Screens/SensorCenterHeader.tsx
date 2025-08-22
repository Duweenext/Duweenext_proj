import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../NavBar/TopBar';

interface SensorCenterHeaderProps {
  onBackPress?: () => void;
}

const SensorCenterHeader: React.FC<SensorCenterHeaderProps> = ({ onBackPress }) => {
  return (
   
      
      <TopBar title={'Sensor Center'}/>

  );
};

export default SensorCenterHeader;
