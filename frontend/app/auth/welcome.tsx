import React, { useEffect } from 'react'
import { useRouter } from 'expo-router';
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

const SplashScreen = () => {
  const navigation = useRouter();

  const [boards, setBoards] = React.useState<Board[]>();

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
        <CardBoardPrimary 
          board={boards ? boards[0] : undefined}
          runningTime="0 hours 0 minutes"
          onButtonPress={() => console.log('Button pressed')}
        />
      </View>
    </ScrollView>
  );
}

export default SplashScreen;
