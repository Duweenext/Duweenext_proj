import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
  Dimensions,
} from 'react-native';

interface TopBarProps {
  title: string;
  textColor?: string;
  onBack?: (event: GestureResponderEvent) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  textColor = '#000000',
  onBack = () => {},
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Image
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/000000/back.png',
            }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 82,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    paddingRight: 12,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#000000',
    marginTop:18,
    resizeMode:'contain'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginTop:18,
    marginRight: 32, // To center title despite back button on left
  },
});

export default TopBar;
