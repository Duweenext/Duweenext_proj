
import { useTitle } from '@/src/hooks/useTitle';
import { themeStyle } from '@/src/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
  Dimensions,
} from 'react-native';

interface TopBarProps {
  title?: string;
  textColor?: string;
  onBack?: (event: GestureResponderEvent) => void;
  showBackButton?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  title: topbar_title,
  textColor = themeStyle.colors.white,
  showBackButton = true
}) => {

  const router = useRouter();
  const title = useTitle();
  if(!topbar_title)
  {
    topbar_title = title;
  }

  return (
    <View style={{
        width: '100%',
        height: 82,
        backgroundColor: themeStyle.colors.primary,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        paddingVertical: 14,
        paddingHorizontal: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    }}>
      <View style={{ 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        }}>
        {showBackButton && <TouchableOpacity onPress={() => router.back()} style={{paddingRight: 12}}>
          <Image
            source={require('@/assets/icons/back-arrowhead.png')}
            style={{
            width: 30,
            height: 30,
            tintColor: themeStyle.colors.white,
            marginTop:18,
            resizeMode:'contain',
            left: 15,
          }}
          />
        </TouchableOpacity>}
        <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
            marginTop:18,
            marginRight: 32,
            color: textColor}}>{topbar_title}</Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

export default TopBar;
