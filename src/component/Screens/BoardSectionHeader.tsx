import { themeStyle } from '@/src/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface BoardSectionHeaderProps {
  title?: string;
  onRefresh?: () => void;
}

const BoardSectionHeader: React.FC<BoardSectionHeaderProps> = ({ title = "Board", onRefresh }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onRefresh} style={{ padding: 8 }}>
          <MaterialIcons
            name="refresh"
            size={26}
            color={themeStyle.colors.white}
          />
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
});

export default BoardSectionHeader;
