import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { theme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import CardBoardExpandedContent from './CardboardExpandContent';
import CardBoardExpandedMemberShip from '@/src/component/Card/CardBoardPrimary/CardBoardExpand/CardBoardExpandMemberShip';
import CardBoardExpandedSetting, { BoardRole } from '@/src/component/Card/CardBoardPrimary/CardBoardExpand/CardboardExpandSetting';
import { t } from 'i18next';

interface MeasurementDashboardProps {
  boardFrequency: number;
  board_id: string;
  board_status?: 'active' | 'inactive';
  board_role: BoardRole;
}

// 1. Move ContainerWrapper outside the main component
// It's now a stable component and won't be redefined on every render.
const ContainerWrapper = ({ children }: { children: React.ReactNode }) => {
    // Note: The original logic `active={activeTab === activeTab}` was always true.
    // This implementation assumes the gradient background is always desired.
    // If conditional rendering is needed, it should be based on a prop.
    return (
        <LinearGradient
          colors={['#95E7E7', '#5A9696']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
        </LinearGradient>
    );
};

const CardBoardExpandedWrapped: React.FC<MeasurementDashboardProps> = ({
  boardFrequency,
  board_id,
  board_status = 'inactive',
  board_role,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'member' | 'setting'>('content');

  // 2. Memoize the tab content
  // This ensures the active component is only re-rendered when its dependencies change.
  const tabContent = useMemo(() => {

    switch (activeTab) {
      case 'content':
        return (
          <CardBoardExpandedContent
            boardFrequency={boardFrequency}
            board_id={board_id}
            board_status={board_status}
          />
        );
      case 'member':
        return (
          <CardBoardExpandedMemberShip
            boardFrequency={boardFrequency}
            board_id={board_id}
            board_status={board_status}
            board_role={board_role}
          />
        );
      case 'setting':
        return (
          <CardBoardExpandedSetting
            boardFrequency={boardFrequency}
            board_id={board_id}
            board_status={board_status}
            role={board_role}
          />
        );
      default:
        return null;
    }
    // Dependency array: recalculate only when these props or state change.
  }, [activeTab, boardFrequency, board_id, board_status]);

  return (
    <ContainerWrapper>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('content')}
          style={[styles.tabButton, activeTab === 'content' && styles.activeTab]}
        >
          <Text style={styles.tabText}>{t('tabs.content')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('member')}
          style={[styles.tabButton, activeTab === 'member' && styles.activeTab]}
        >
          <Text style={styles.tabText}>{t('tabs.member')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('setting')}
          style={[styles.tabButton, activeTab === 'setting' && styles.activeTab]}
        >
          <Text style={styles.tabText}>{t('tabs.setting')}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: theme.spacing.md }}>
        {tabContent}
      </View>
    </ContainerWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#fff',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  }
});

// 3. Wrap the export in React.memo for further optimization
export default React.memo(CardBoardExpandedWrapped);