import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MemberShip, useBoard } from '@/src/api/hooks/useBoard';
import { theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/auth/context/auth_context';
import ApprovalModal from '@/src/component/Modals/ApprovalModal';
import KickConfirmationModal from '@/src/component/Modals/KickModal';
import { MaterialIcons } from '@expo/vector-icons';
import { BoardRole } from './CardboardExpandSetting';

interface CardBoardExpandedMemberShipProps {
  boardFrequency: number;
  board_id: string;
  board_status?: 'active' | 'inactive';
  board_role: BoardRole;
}

const CardBoardExpandedMemberShip: React.FC<CardBoardExpandedMemberShipProps> = ({ board_id , board_role}) => {
  const { t } = useTranslation();
  const { getBoardMembers, approveOrRejectMember, kickMember } = useBoard();
  const { user } = useAuth();
  const [modal, setModal] = React.useState<"approval" | "kick" | "">("");

  const { data: members, isLoading } = useQuery({
    queryKey: ['boards', 'members', board_id],
    queryFn: () => getBoardMembers(board_id),
    enabled: !!board_id,
    staleTime: 60_000,
  });

  const isOwner = members?.some(member => member.user_id === user?.id && member.role === 'owner');

  const handleApproval = async (relationship_id: number, approval: 'approved' | 'rejected') => {
    await approveOrRejectMember(relationship_id, approval);
  }

  const handleKick = async (relationship_id: number) => {
    kickMember(relationship_id);
  }

  const renderMemberItem = ({ item }: { item: MemberShip }) => (
    <View style={styles.memberCard}>
      <Text style={styles.memberName}>
        {item.user_name || t('Unnamed User')}
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
        <Text style={[styles.roleBadge, getRoleStyle(item.role)]}>
          {t(item.role)}
        </Text>
        <Pressable onPress={() => {
          setModal("approval")
        }}>
          <Text style={[styles.roleBadge, getRoleStyle(item.role)]} >
            {t(item.approval)}
          </Text>
        </Pressable>
        {isOwner && item.approval === 'approved' && item.role !== 'owner' && (
          <Pressable onPress={() => setModal("kick")}>
            <MaterialIcons name="person-remove" size={24} color="#666" />
          </Pressable>
        )}
      </View>

      <ApprovalModal
        visible={!!(modal === "approval" && isOwner && item.approval === 'pending')}
        title={t('Confirm Action')}
        message={t('Are you sure you want to proceed?')}
        onApprove={() => handleApproval(item.relationship_id, 'approved').then(() => setModal(""))}
        onReject={() => handleApproval(item.relationship_id, 'rejected').then(() => setModal(""))}
        onClose={() => setModal("")}
      />

      <KickConfirmationModal
        visible={modal === "kick"}
        message={`${t('Are you sure you want to remove')} ${item.user_name || t('this user')}?`}
        onConfirm={() => {
          handleKick(item.relationship_id).then(() => setModal(""));
        }}
        onClose={() => setModal("")}
        title={t('kickMemberTitle')}
      />
    </View>
  );

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'owner': return { backgroundColor: '#1A736A', color: 'white' };
      case 'admin': return { backgroundColor: '#3B82F6', color: 'white' };
      case 'labor': return { backgroundColor: '#F59E0B', color: 'white' };
      case 'user': default: return { backgroundColor: '#E5E7EB', color: '#374151' };
    }
  };

  return (
    board_role === 'owner' ? <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('Board Members')}</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : !members || members.length === 0 ? (
        <Text style={styles.emptyText}>{t('No members found')}</Text>
      ) : (
        <FlatList
          data={members}
          scrollEnabled={false}
          keyExtractor={(item) => item.relationship_id.toString()}
          renderItem={renderMemberItem}
          contentContainerStyle={{ gap: theme.spacing.xs }}
        />
      )}
    </View> : 
    <View style={styles.section}>
      <Text style={styles.memberText}>{t('Only board owners can manage members.')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md
  },
  memberText:{
    fontSize: 16,
    color: '#111827',
    fontFamily: theme.fontFamily.medium,
    alignSelf: 'center'
  },
  sectionTitle: {
    fontSize: theme.fontSize.header1,
    fontFamily: theme.fontFamily.semibold,
    color: 'black',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: theme.fontFamily.medium,
    marginTop: 10,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberName: {
    fontSize: 16,
    color: '#111827',
    fontFamily: theme.fontFamily.medium,
  },
  roleBadge: {
    fontSize: 13,
    fontFamily: theme.fontFamily.semibold,
    textTransform: 'capitalize',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default CardBoardExpandedMemberShip;
