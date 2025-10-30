import React, { useState } from 'react';
import { View, ScrollView, StatusBar, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import AddBoardSection from '@/src/component/Screens/AddBoardSection';
import BoardSectionHeader from '@/src/component/Screens/BoardSectionHeader';
import CardBoardPrimary from '@/src/component/Card/CardBoardPrimary/CardBoardPrimary';
import { useBoard } from '@/src/api/hooks/useBoard';
import PullToRefreshScreen from '@/src/component/Screens/PullToRefresh';
import LoadingSpinner from '@/src/component/Others/LoadingIndicator';
import { WifiConfig } from '@/src/interfaces/wifi';
import { useBle } from '@/src/ble/useBle.native';
import { useAuth } from '@/src/auth/context/auth_context';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

const SensorScreen = () => {

  const { t } = useTranslation();
  const { user } = useAuth();
  const { boards, loading } = useBoard();

  const queryClient = useQueryClient();

  const onRefreshBoards = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['boards', user!.id] });

      Toast.show({
        type: 'successToast',
        text1: t('Refreshed'),
        text2: t('Board refresh successfully.'),
        position: 'top',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: t('Error'),
        text2: t('Could not refresh boards.'),
        position: 'top',
      });
    }
  }

  console.log("Rendering SensorScreen with boards:", boards);

  const [reprovisioningBoardId, setReprovisioningBoardId] = useState<string | undefined>();
  return (
    <View style={{ flex: 1 }}>

      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <AddBoardSection
          reprovisionBoardId={reprovisioningBoardId || ""}
          onFlowComplete={() => setReprovisioningBoardId(undefined)}
        />
        <BoardSectionHeader title={t("Board")} onRefresh={onRefreshBoards} />
        <View style={{ paddingHorizontal: 16, paddingBottom: 20, gap: 12 }}>
          {boards ? boards.map((board) => (
            <CardBoardPrimary
              key={board.board_id}
              board={board}
            />
          )) : loading ? (
            <LoadingSpinner size="large" />
          ) : (
            <Text>{t("No boards available")}</Text>
          )}
        </View>


      </ScrollView>
    </View>
  );
};

export default SensorScreen;
