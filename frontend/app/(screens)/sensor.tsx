import React, { useEffect, useState } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { router } from 'expo-router';

// Components
import SensorCenterHeader from '@/component-v2/Screens/SensorCenterHeader';
import AddBoardSection from '@/component-v2/Screens/AddBoardSection';
import BoardSectionHeader from '@/component-v2/Screens/BoardSectionHeader';
import CardBoardPrimary from '@/component-v2/Card/CardBoardPrimary/CardBoardPrimary';

// Data
import { mockBoards, formatRunningTime, type ExtendedBoardData } from '@/component-v2/Screens/mockBoardData';
import { useTranslation } from 'react-i18next';

// Main Sensor Screen
const SensorScreen = () => {
  const [boardId, setBoardId] = useState('');

  const {t} = useTranslation();

  const handleBackPress = () => {
    router.back();
  };

  const handleBleSelect = () => {
    // setShowBleModal(true);
  };

  const handleManualSubmit = (boardId: string) => {
    console.log('Manual board ID submitted:', boardId);
  };

  const handleBoardIconPress = (board: ExtendedBoardData) => {
    console.log('Board icon pressed:', board.board_name);
  };

  const handleBoardButtonPress = (board: ExtendedBoardData) => {
    console.log('Board button pressed:', board.board_name, board.board_status);
  };

  useEffect(() => {
    if (boardId) {
      console.log('Board ID updated:', boardId);
    }
  }, [boardId]);

  return (
    <View style={{ flex: 1 }}>

      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      {/* <SensorCenterHeader onBackPress={handleBackPress} /> */}
      
      {/* Main Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Add Board Section */}
        <AddBoardSection 
          onSelectBLE={handleBleSelect}
          onManualSubmit={handleManualSubmit}
        />
        
        {/* Board Section */}
        <BoardSectionHeader title="Board" />
        
        <View style={{ paddingHorizontal: 16, paddingBottom: 20, gap: 12 }}>
          {mockBoards.map((board) => (
            <CardBoardPrimary
              key={board.board_id}
              board={board}
              runningTime={formatRunningTime(board.running_time || 0)}
              onIconPress={() => handleBoardIconPress(board)}
              onButtonPress={() => handleBoardButtonPress(board)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SensorScreen;
