import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddBoardModal from '@/component-v2/Modals/AddBoardModal';
import ManualAddBoardModal from '@/component-v2/Modals/ManualAddBoardModal';
import BleConfigModal from '@/components/modal/sensor/bleModal';

interface AddBoardSectionProps {
  onSelectBLE?: () => void;
  onManualSubmit?: (boardId: string) => void;
}

const AddBoardSection: React.FC<AddBoardSectionProps> = ({ 
  onSelectBLE,
  onManualSubmit
}) => {
  const [modalVisible, setModalVisible] = useState<"manual" | "ble" | "option" | "">("");
  // const [manualModalVisible, setManualModalVisible] = useState(false);

  const handleAddBoard = () => {
    setModalVisible("option");
  };

  const handleCloseModal = () => {
    setModalVisible("");
  };

  const handleManualSelect = () => {
    setModalVisible("manual");
    // setManualModalVisible(true);
  };

  const handleBLESelect = () => {
    setModalVisible("ble");
    onSelectBLE?.();
  };

  // const handleCloseManualModal = () => {
  //   // setManualModalVisible(false);
  // };

  const handleManualSubmit = (boardId: string) => {
    // setManualModalVisible(false);
    setModalVisible("");
    onManualSubmit?.(boardId);
  };
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Add Board</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.addButton} onPress={handleAddBoard} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      <AddBoardModal
        visible={modalVisible === "option"}
        onClose={handleCloseModal}
        onSelectManual={handleManualSelect}
        onSelectBLE={handleBLESelect}
      />

      <BleConfigModal
        visible={modalVisible === "ble"}
        onClose={handleCloseModal}
        onSelectDevice={() => {}}
      />

      <ManualAddBoardModal
        visible={modalVisible === "manual"}
        onClose={handleCloseModal}
        onSubmit={handleManualSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default AddBoardSection;
