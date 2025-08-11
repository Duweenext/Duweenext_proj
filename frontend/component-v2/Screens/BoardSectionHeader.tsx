import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BoardSectionHeaderProps {
  title?: string;
}

const BoardSectionHeader: React.FC<BoardSectionHeaderProps> = ({ title = "Board" }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
});

export default BoardSectionHeader;
