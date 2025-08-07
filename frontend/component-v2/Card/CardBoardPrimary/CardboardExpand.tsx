// components/CardBoardExpanded.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface ExpandedSectionProps {
  max: number;
  min: number;
  frequency: number;
  onMaxChange: (v: string) => void;
  onMinChange: (v: string) => void;
  onFreqChange: (v: string) => void;
}

export const CardBoardExpanded: React.FC<ExpandedSectionProps> = ({
  max, min, frequency, onMaxChange, onMinChange, onFreqChange
}) => (
  <View style={styles.expanded}>
    ddd
  </View>
);

const styles = StyleSheet.create({
  expanded: {
    paddingTop: 12,
    backgroundColor: theme.colors.background2
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: {
    fontSize: parseInt(theme.fontSize.description, 10),
    fontFamily: theme.fontFamily['r-medium'][0],
    marginRight: 8,
  },
  subLabel: { marginRight: 4 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  input: {
    borderWidth: 1,
    borderRadius: parseInt(theme.borderRadius.sm, 10),
    paddingHorizontal: 8,
    height: 32,
    minWidth: 48,
    textAlign: 'center',
    marginRight: 4,
  },
  unit: {
    fontSize: parseInt(theme.fontSize.description, 10),
    marginRight: 12,
  },
  graph: {
    height: 150,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: parseInt(theme.borderRadius.sm, 10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphText: {
    color: '#FFF',
  },
});
