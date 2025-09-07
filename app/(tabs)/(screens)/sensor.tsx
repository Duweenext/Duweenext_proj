import React, { useEffect } from 'react';
import { View, ScrollView, StatusBar, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatRunningTime } from '@/src/component/Screens/mockBoardData';
import AddBoardSection from '@/src/component/Screens/AddBoardSection';
import BoardSectionHeader from '@/src/component/Screens/BoardSectionHeader';
import CardBoardPrimary from '@/src/component/Card/CardBoardPrimary/CardBoardPrimary';
import { useBoard } from '@/src/api/hooks/useBoard';
import { useAuth } from '@/src/auth/context/auth_context';
import PullToRefreshScreen from '@/src/component/Screens/PullToRefresh';
import LoadingSpinner from '@/src/component/Others/LoadingIndicator';

const SensorScreen = () => {

  const { t } = useTranslation();
  const {boards, loading , refetchBoards} = useBoard();

  console.log("Boards:", boards);

  const { user } = useAuth();

  const handleRefresh = async () => {
    if (user?.id) {
      await refetchBoards();
    }
  };

  return (
    <PullToRefreshScreen onRefresh={handleRefresh}>
      <View style={{ flex: 1 }}>

        <StatusBar barStyle="dark-content" backgroundColor="white" />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <AddBoardSection
          />
          <BoardSectionHeader title="Board" />
          <View style={{ paddingHorizontal: 16, paddingBottom: 20, gap: 12 }}>
            {boards ? boards.map((board) => (
              <CardBoardPrimary
                key={board.board_id}
                board={board}
              />
            )) : loading ? (
              <LoadingSpinner size="large" />
            ) : (
              <Text>No boards available</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </PullToRefreshScreen>
  );
};

export default SensorScreen;
