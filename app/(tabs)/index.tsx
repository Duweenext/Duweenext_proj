import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { icons } from "@/src/constants/icons";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import TabBox from "@/src/component/TabBox";
import SummaryChart from "@/src/component/Chart/HomepageChart";
import { useBoard } from "@/src/api/hooks/useBoard";
import PullToRefreshScreen from "@/src/component/Screens/PullToRefresh";
import { useAuth } from "@/src/auth/context/auth_context";
import { theme, themeStyle } from "@/theme";
import { BoardRelationship } from "@/src/interfaces/board";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { ScrollView } from "react-native-gesture-handler";

export default function Index() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { boards } = useBoard();

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
      console.error("Error refreshing boards:", error);
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Could not refresh boards.'),
        position: 'top',
      });
    }
  }

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedBoardName, setSelectedBoardName] = useState<string>(t("Loading..."));
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (boards && boards.length > 0) {
      // If no board is selected yet, default to the first one
      if (!selectedBoardId || !boards.some(b => b.board_id === selectedBoardId)) {
        const firstBoard = boards[0];
        setSelectedBoardId(firstBoard.board_id);
        setSelectedBoardName(firstBoard.board_name || `Board ${firstBoard.board_id}`);
      }
    } else if (!boards || boards.length === 0) {
      // Handle the case where there are no boards
      setSelectedBoardId(null);
      setSelectedBoardName(t("No boards found"));
    }
  }, [boards, t]);

  const handleBoardSelect = (board: BoardRelationship) => {
    setSelectedBoardId(board.board_id);
    setSelectedBoardName(board.board_name || `Board ${board.board_id}`);
    setIsModalVisible(false); // Close the modal after selection
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <View style={styles.Boxcontainer}>
        {/* Top Tab Boxes */}
        <View style={styles.tabBoxContainer}>
          <TabBox
            title={t("Sensor")}
            icon={icons.sensor}
            onNav={() => router.push("/(tabs)/(screens)/sensor")}
            image_width={45}
            image_height={45}
          />
          <TabBox
            title={t("Check Pond Health")}
            icon={icons.camera}
            onNav={() => router.push("/(tabs)/(screens)/check-pond-health")}
            image_height={35}
            image_width={35}
          />
          <TabBox
            title={t("Notification History")}
            icon={icons.assistant}
            onNav={() => router.push("/(tabs)/(screens)/notification_history")}
            image_height={50}
            image_width={50}
          />
        </View>

        {/* Activity Overview Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.chartTitle}>{t("Activity Overview")}</Text>
              <TouchableOpacity onPress={onRefreshBoards} style={{ padding: 8 }}>
                <MaterialIcons
                  name="refresh"
                  size={26}
                  color={themeStyle.colors.black}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.boardSelectorButton}
              onPress={() => setIsModalVisible(true)}
              disabled={!boards || boards.length === 0}
            >
              <Text style={styles.boardSelectorText} numberOfLines={1}>
                {selectedBoardName}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.chartContent}>
            {selectedBoardId ? (
              <SummaryChart boardId={selectedBoardId} />
            ) : (
              <Text style={styles.noDataText}>
                {t("Please select a board to view data.")}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Board Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Select a Board")}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color={theme.colors.grey} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={boards}
              keyExtractor={(item) => item.board_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleBoardSelect(item)}
                >
                  <Text style={styles.modalItemText}>
                    {item.board_name || `Board ${item.board_id}`}
                  </Text>
                  {item.board_id === selectedBoardId && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  Boxcontainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tabBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
    gap: 12,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  boardSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    maxWidth: 160,
  },
  boardSelectorText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 5,
    flexShrink: 1,
  },
  chartContent: {
    gap: 10,
    paddingVertical: 5,
    minHeight: 150,
    overflow: 'hidden',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.colors.grey,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  modalItemText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});