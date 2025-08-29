import React, { useEffect} from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatRunningTime } from '@/src/component/Screens/mockBoardData';
import AddBoardSection from '@/src/component/Screens/AddBoardSection';
import BoardSectionHeader from '@/src/component/Screens/BoardSectionHeader';
import CardBoardPrimary from '@/src/component/Card/CardBoardPrimary/CardBoardPrimary';
import { useBoard } from '@/src/api/hooks/useBoard';
import { useAuth } from '@/src/auth/context/auth_context';
import { formatRunningTimeFromTimestamp } from '@/src/utlis/input';

const SensorScreen = () => {

  const {t} = useTranslation();
  const { getAllBoardByUserId , boards, loading} = useBoard();

  const { user} = useAuth();

  const handleBleSelect = () => {
  };

  useEffect(() => {
    const fetchBoards = async (user_id: number) => {
      const res = await getAllBoardByUserId(user_id);
      console.log('Fetched boards for user:', res);
    }
    if(user?.id)
    {
      fetchBoards(user.id);
    }
  }, [getAllBoardByUserId]);

  useEffect(() => {
    console.log("Boards updated:", boards);
  }, [boards]);

  return (
    <View style={{ flex: 1 }}>

      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <AddBoardSection 
          onSelectBLE={handleBleSelect}
        />
        <BoardSectionHeader title="Board" />
        
        <View style={{ paddingHorizontal: 16, paddingBottom: 20, gap: 12 }}>
          {boards.map((board) => (
            <CardBoardPrimary
              key={board.board_id}
              board={board}
              // runningTime={formatRunningTimeFromTimestamp(board.updated_at)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SensorScreen;
