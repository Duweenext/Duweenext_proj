import React, { useEffect } from 'react'
import { useRouter } from 'expo-router';
import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import TextFieldModal from '@/component-v2/TextFields/TextFieldModal';
import TextFieldSensorValue from '@/component-v2/TextFields/TextFieldSensorValue';
import TextFieldVerificationCode from '@/component-v2/TextFields/TextFieldVerificationCode';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';
import ButtonModalL from '@/component-v2/Buttons/ButtonModalL';
import ButtonModalXL from '@/component-v2/Buttons/ButtonModalXL';
import ButtonCard from '@/component-v2/Buttons/ButtonCard';
import ButtonGoogle from '@/component-v2/Buttons/ButtonGoogle';
import ButtonUnderline from '@/component-v2/Buttons/ButtonUnderline';
import DropDownTemplate from '@/component-v2/Dropdown/DropDownTemplate';
import TopBar from '@/component-v2/NavBar/TopBar';
import ButtonAddBoard from '@/component-v2/Buttons/ButtonAddBoard';
import ModalVerificationComplete from '@/component-v2/Modals/ModalVerificationComplete';
import CardIcon from '@/component-v2/Card/CardIcon';
import CardBoardPrimary from '@/component-v2/Card/CardBoardPrimary/CardBoardPrimary';
import { theme } from '@/theme';
import { ScrollView, View } from 'react-native';
import { Board } from '@/srcs/interfaces/board';
import { DateDisplayOnCard } from '@/srcs/utlis/date';
import { CardBoardModal } from '@/component-v2/Card/CardBoardModal';
import { CardImageProcessingResult } from '@/component-v2/Card/CardImageProcessingResult';
import { Ionicons} from '@expo/vector-icons';
import { CardEducation } from '@/component-v2/Card/CardEducation';
import { CardImageProcessingHistory } from '@/component-v2/Card/CardImageProcessingHistory';
import { CardNotification } from '@/component-v2/Card/CardNotification';
import { SettingCard } from '@/component-v2/Card/SettingCard';
import { SensorCard } from '@/component-v2/Card/CardSensor';
import ButtonCamera from '@/component-v2/Buttons/ButtonCamera';
import ModalChangeInformation from '@/component-v2/Modals/ModalChangeInformation';

const SplashScreen = () => {
  const navigation = useRouter();

  const [boards, setBoards] = React.useState<Board[]>();
  const [modalVisible, setModalVisible] = React.useState(true); // or false initially
const [password, setPassword] = React.useState('');

const handleNext = () => {
  console.log('Next pressed with password:', password);
};

const handleSendAgain = () => {
  console.log('Resend verification triggered');
};


  useEffect(() => {
    setBoards([{
      board_id: 1,
      updated_at: DateDisplayOnCard('2023-10-01T11:00:00Z', ''),
      created_at: DateDisplayOnCard('2023-10-01T12:00:00Z', ''),
      board_name: 'Board 1',
      board_status: 'connected',
      board_register_date: DateDisplayOnCard('2023-10-01T12:00:00Z', ''),
      deleted_at: null,
      sensor_id: 1,
    }])
  }, [])

  return (
    <ScrollView>
      <View
        style={{
          justifyContent: 'center',
          // alignItems: 'center',
          backgroundColor: theme.colors['background1'],
          height: 'auto',
          padding: theme.spacing.md,
        }}
      >
        
      </View>
    </ScrollView>
  );
  
}

export default SplashScreen;
