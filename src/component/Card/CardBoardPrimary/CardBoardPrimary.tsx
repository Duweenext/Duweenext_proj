// components/Esp32Card.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { BoardConnectionStatus, BoardRelationship } from '@/src/interfaces/board';
import CardBoardExpanded from './CardboardExpand';
import ButtonCard from '../../Buttons/ButtonCard';
import { useBoard } from '@/src/api/hooks/useBoard';
import { formatRunningTimeFromTimestamp } from '@/src/utlis/input';
import TextFieldPrimary from '../../TextFields/TextFieldPrimary';
import TextFieldSensorValue from '../../TextFields/TextFieldSensorValue';
import IconButton from '../../Buttons/IconButton';
import UnderlineTextField from '../../TextFields/TextFieldUnderline';
import DeleteConfirmModal from '../../Modals/ConfirmDelete';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

const displayStatusMap = {
    active: t('Connected'),
    inactive: t('Disconnected'),
} as const;

const displayStatusActionLabel = {
    active: t('Disconnect'),
    inactive: t('Connect'),
}

interface Esp32CardProps {
    runningTime?: string;
    onIconPress?: (e: GestureResponderEvent) => void;
    board: BoardRelationship;
    frequency?: number;
}

// everything in one place:
const variants: Record<
    BoardConnectionStatus,
    {
        cardBg: string;
        textColor: string;
        buttonBg: string;
        buttonText: string;
        iconColor: string;
    }
> = {
    active: {
        cardBg: theme.colors.primary,
        textColor: '#FFFFFF',
        buttonBg: '#FFFFFF',
        buttonText: theme.colors.primary,
        iconColor: '#FFFFFF',
    },
    inactive: {
        cardBg: theme.colors['background1'],
        textColor: '#000000',
        buttonBg: '#FFFFFF',
        buttonText: '#000000',
        iconColor: '#ffffff',
    },
};

const CardBoardPrimary: React.FC<Esp32CardProps> = ({
    board,
}) => {
    const {t} = useTranslation();
    const mode = board?.board_status || 'inactive' as BoardConnectionStatus;
    const [boardName, setBoardName] = useState(board.board_name || 'Unnamed Board');
    const [expanded, setExpanded] = useState(false);
    const [isEditBoardName, setIsEditBoardName] = useState(false);
    const { cardBg, textColor, buttonBg, buttonText, iconColor } =
        variants[mode] || variants.inactive;
    const [lastActive, setLastActive] = useState<string | null>(null);
    const [modal, setModal] = useState<"delete" | "">();
    const [isTitleMultiline, setIsTitleMultiline] = React.useState(false);

    const [titleWidth, setTitleWidth] = useState<number | undefined>(undefined);

    useEffect(() => {
        setLastActive(formatRunningTimeFromTimestamp(board.updated_at));
    }, [])

    const onTitleTextLayout = (e: any) => {
        const line = e.nativeEvent.lines?.[0];
        if (line?.width) setTitleWidth(Math.ceil(line.width));
        const wrapped = (e?.nativeEvent?.lines?.length ?? 1) > 1;
        setIsTitleMultiline(wrapped);
    };

    const { loading, editBoardName, deleteBoard, refetchBoards } = useBoard();

    const handleExpand = async () => {
        setExpanded(!expanded);
    };

    const [tick, setTick] = useState(0);

    const handleEditBoardName = async () => {
        await editBoardName(board.board_id, boardName);
        setIsEditBoardName(false);
    }

    const handleDeleteCardBoard = async () => {
        await deleteBoard(board.id);
        await refetchBoards();
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (board.board_status === 'active') {
                setTick(prev => prev + 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const runningTimeActive = useMemo(() => {
        if (board.board_status === 'active') {
            return formatRunningTimeFromTimestamp(board.updated_at);
        }
    }, [board.updated_at, board.board_status, tick]);

    const displayStatus = t(displayStatusMap[mode])

    return (
        <View>
            <TouchableOpacity onPress={handleExpand} disabled={mode !== 'active' || isEditBoardName}>
                <View style={[styles.card, {
                    backgroundColor: cardBg,
                    borderBottomEndRadius: expanded ? 0 : theme.borderRadius.lg,
                    borderBottomStartRadius: expanded ? 0 : theme.borderRadius.lg,
                }]}>
                    <View style={styles.content}>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: isTitleMultiline ? 'flex-start' : 'center', justifyContent: 'space-between', width: '100%' }}>
                            <View style={{ flexDirection: isTitleMultiline ? 'column' : 'row', gap: isTitleMultiline ? 0 : 8, alignItems: isTitleMultiline ? 'flex-start' : 'center', maxWidth: '80%' }}>
                                {!isEditBoardName ?
                                    <Text
                                        style={[styles.title, { color: textColor }]}
                                        numberOfLines={3}
                                        onTextLayout={onTitleTextLayout}
                                    >
                                        {boardName}
                                    </Text> :
                                    <UnderlineTextField
                                        value={boardName}
                                        onChangeText={setBoardName}
                                        // match text visuals
                                        inputStyle={{
                                            color: textColor,
                                            fontSize: theme.fontSize.header1,
                                            fontFamily: theme.fontFamily.medium,
                                            lineHeight: theme.fontSize.header1 * 1.2,
                                            paddingHorizontal: 0,
                                            paddingVertical: 0, 
                                        }}
                                        style={{ width: Math.max(titleWidth ?? 10, 120) }}
                                        width={titleWidth}
                                        placeholder=""
                                    />
                                }
                                {!isEditBoardName ?
                                    <ButtonCard
                                        text={t('edit')}
                                        filledColor={theme.colors.warning}
                                        borderColor=''
                                        width={50}
                                        height={20}
                                        textColor={buttonText}
                                        onPress={() => {
                                            setIsEditBoardName(true);
                                        }}
                                    /> :
                                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                                        <IconButton
                                            source={require('@/assets/icons/check.png')}
                                            size={20}
                                            tintColor={mode === 'active' ? theme.colors.background2 : theme.colors.primary}
                                            onPress={handleEditBoardName}
                                        />
                                        <IconButton
                                            source={require('@/assets/icons/cancel.png')}
                                            size={20}
                                            tintColor={theme.colors.fail}
                                            onPress={() => {
                                                setBoardName(board.board_name || 'Unnamed Board');
                                                setIsEditBoardName(false);
                                            }}
                                        />
                                    </View>
                                }
                            </View>
                            <TouchableOpacity style={styles.iconButton} onPress={() => setExpanded(!expanded)} disabled={mode !== 'active' || isEditBoardName}>
                                <Ionicons
                                    name={expanded ? "chevron-down" : "chevron-forward"}
                                    size={24}
                                    color={iconColor}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            {mode === 'inactive' && (
                                <Text style={[styles.description, { color: textColor }]}>
                                    Last connected: {fromISOTimeToLocaleString(board?.updated_at) || 'N/A'}
                                </Text>
                            )}
                            <Text style={[styles.description, { color: textColor }]}>
                                {t('Running')}: {board.board_status === 'active' ? runningTimeActive : lastActive}
                            </Text>
                            <Text style={[styles.description, { color: textColor }]}>
                                {t('Status')}: {displayStatus}
                            </Text>
                        </View>
                        <View style={[styles.leftsection, { gap: mode === "inactive" ? 32 : 18 }]}>

                            <ButtonCard
                                text={t('delete')}
                                filledColor={buttonBg}
                                textColor={buttonText}
                                onPress={() => setModal("delete")}
                            />
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
            {expanded && mode === "active" && (
                <CardBoardExpanded
                    boardFrequency={board.sensor_frequency}
                    board_id={board.board_id}
                />
            )}

            <DeleteConfirmModal
                visible={modal === "delete"}
                title="Delete this board?"
                message="This action cannot be undone."
                loading={loading}
                onCancel={() => setModal("")}
                onConfirm={handleDeleteCardBoard}
            />
        </View>
    );
};

export default CardBoardPrimary;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 16,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    iconButton: {
        padding: 8,
    },
    content: {
        marginHorizontal: 8,
        // gap: 3,
    },
    timestamp: {
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    title: {
        fontSize: theme.fontSize['header1'],
        fontFamily: theme.fontFamily.medium,
    },
    description: {
        // marginTop: 4,
        fontSize: theme.fontSize.description,
        fontFamily: theme.fontFamily.regular,
    },
    leftsection: {
        flexDirection: 'column',
        bottom: 0,
        alignSelf: 'flex-end',
        // height: '100%',
        position: 'absolute',
    }
});


const fromISOTimeToLocaleString = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
};
