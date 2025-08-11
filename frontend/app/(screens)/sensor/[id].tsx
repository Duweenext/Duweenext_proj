// import React, { useEffect, useState } from 'react';
// import { View, ScrollView, StatusBar } from 'react-native';
// import { router } from 'expo-router';

// // Components
// import SensorCenterHeader from '@/component-v2/Screens/SensorCenterHeader';
// import AddBoardSection from '@/component-v2/Screens/AddBoardSection';
// import BoardSectionHeader from '@/component-v2/Screens/BoardSectionHeader';
// import CardBoardPrimary from '@/component-v2/Card/CardBoardPrimary/CardBoardPrimary';

// // Modals
// import OptionModal from '@/components/modal/sensor/optionalModal';
// // import ManualConfigModal from '@/components/modal/sensor/manuaModal';
// import BleConfigModal from '@/components/modal/sensor/bleModal';
// import WifiConfigModal, { WifiFormData } from '@/components/modal/sensor/wificonfigModal';

// // Data
// import { mockBoards, formatRunningTime, type ExtendedBoardData } from '@/component-v2/Screens/mockBoardData';

// // Main Sensor Screen
// const SensorScreen = () => {
//   const [showOptionModal, setShowOptionModal] = useState(false);
//   const [showManualModal, setShowManualModal] = useState(false);
//   const [showBleModal, setShowBleModal] = useState(false);
//   const [showWifiConfig, setShowWifiConfig] = useState(false);
//   const [boardId, setBoardId] = useState('');

//   const handleBackPress = () => {
//     router.back();
//   };

//   const openOptionModal = () => {
//     setShowOptionModal(true);
//   };

//   const handleManualSelect = () => {
//     setShowOptionModal(false);
//     setShowManualModal(true);
//   };

//   const handleBleSelect = () => {
//     setShowOptionModal(false);
//     setShowBleModal(true);
//   };

//   const handleCloseAll = () => {
//     setShowOptionModal(false);
//     setShowManualModal(false);
//     setShowBleModal(false);
//     setShowWifiConfig(false);
//   };

//   const handleDeviceSelect = (selectedId: string) => {
//     setBoardId(selectedId);
//     setShowBleModal(false);
//     setShowWifiConfig(true);
//   };

//   const handleWifiSubmit = (data: WifiFormData) => {
//     console.log('Wi-Fi Config Submitted:', data);
//     handleCloseAll();
//   };

//   const handleBoardIconPress = (board: ExtendedBoardData) => {
//     console.log('Board icon pressed:', board.board_name);
//   };

//   const handleBoardButtonPress = (board: ExtendedBoardData) => {
//     console.log('Board button pressed:', board.board_name, board.board_status);
//   };

//   useEffect(() => {
//     if (boardId) {
//       console.log('Board ID updated:', boardId);
//     }
//   }, [boardId]);

//   return (
//     <View style={{ flex: 1 }}>
//       <StatusBar barStyle="dark-content" backgroundColor="white" />
      
//       {/* Header */}
//       <SensorCenterHeader onBackPress={handleBackPress} />
      
//       {/* Main Content */}
//       <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
//         {/* Add Board Section */}
//         <AddBoardSection />
        
//         {/* Board Section */}
//         <BoardSectionHeader title="Board" />
        
//         {/* Board Cards */}
//         <View style={{ paddingHorizontal: 16, paddingBottom: 20, gap: 12 }}>
//           {mockBoards.map((board) => (
//             <CardBoardPrimary
//               key={board.board_id}
//               board={board}
//               runningTime={formatRunningTime(board.running_time || 0)}
//               onIconPress={() => handleBoardIconPress(board)}
//               onButtonPress={() => handleBoardButtonPress(board)}
//             />
//           ))}
//         </View>
//       </ScrollView>

//       {/* Modals */}
//       <OptionModal
//         visible={showOptionModal}
//         onSelectBle={handleBleSelect}
//         onSelectManual={handleManualSelect}
//         onClose={() => setShowOptionModal(false)}
//       />

//       {/* <ManualConfigModal
//         visible={showManualModal}
//         onClose={handleCloseAll}
//       /> */}

//       <BleConfigModal
//         visible={showBleModal}
//         onClose={handleCloseAll}
//         onSelectDevice={handleDeviceSelect}
//       />

//       <WifiConfigModal
//         visible={showWifiConfig}
//         onClose={handleCloseAll}
//         onSubmit={handleWifiSubmit}
//         boardId={boardId}
//       />
//     </View>
//   );
// };

// export default SensorScreen;