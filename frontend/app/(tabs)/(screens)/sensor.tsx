import React, { useEffect, useState } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { router } from 'expo-router';

// Components

// Data
import { useTranslation } from 'react-i18next';
import { ExtendedBoardData, formatRunningTime, mockBoards } from '@/src/component/Screens/mockBoardData';
import AddBoardSection from '@/src/component/Screens/AddBoardSection';
import BoardSectionHeader from '@/src/component/Screens/BoardSectionHeader';
import CardBoardPrimary from '@/src/component/Card/CardBoardPrimary/CardBoardPrimary';

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
      
      {/* Main Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Add Board Section */}
        <AddBoardSection 
          onSelectBLE={handleBleSelect}
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
