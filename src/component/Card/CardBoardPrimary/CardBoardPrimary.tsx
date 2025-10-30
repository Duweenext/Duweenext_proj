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
import CardBoardExpandedWrapped from '@/src/component/Card/CardBoardPrimary/CardBoardExpand/CardboardExpandWrapped';
import ButtonCard from '../../Buttons/ButtonCard';
import { useBoard } from '@/src/api/hooks/useBoard';
import { formatRunningTimeFromTimestamp } from '@/src/utlis/input';
import IconButton from '../../Buttons/IconButton';
import UnderlineTextField from '../../TextFields/TextFieldUnderline';
import DeleteConfirmModal from '../../Modals/ConfirmDelete';
import { useTranslation } from 'react-i18next';
import i18next, { t} from 'i18next';
import WifiConfigModal from '../../Modals/wificonfigModal';
import ConnectionPasswordModal from '../../Modals/ConnectionPasswordModal';
import { WifiConfig } from '@/src/interfaces/wifi';
import { useBle } from '@/src/ble/useBle.native';
import Toast from 'react-native-toast-message';
import i18n from '@/src/i18n/i18n.config';

const displayStatusMap = {
    active: 'status.connected',
    inactive: 'status.disconnected',
};

interface Esp32CardProps {
    runningTime?: string;
    onIconPress?: (e: GestureResponderEvent) => void;
    board: BoardRelationship;
    frequency?: number;
}

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
    const { t } = useTranslation();
    const mode = board?.board_status || 'inactive' as BoardConnectionStatus;
    const [boardName, setBoardName] = useState(board.board_name || 'Unnamed Board');
    const [expanded, setExpanded] = useState(false);
    const [isEditBoardName, setIsEditBoardName] = useState(false);
    const { cardBg, textColor, buttonBg, buttonText, iconColor } =
        variants[mode] || variants.inactive;
    const [lastActive, setLastActive] = useState<string | null>(null);
    const [modal, setModal] = useState<"delete" | "wifi-config" | "connect-password" | "">();
    const [isTitleMultiline, setIsTitleMultiline] = React.useState(false);
    const [wifiInfo, setWifiInfo] = useState<WifiConfig>();

    const [titleWidth, setTitleWidth] = useState<number | undefined>(undefined);

    const handleReconnectProvision = async (values: WifiConfig) => {
        if (!values.ssid || !values.wifiPassword) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Input',
                text2: 'SSID and Password are required to re-provision Wi-Fi.'
            });
            return;
        }

        const deviceId = board.mac_address; 

        setModal(""); 

        try {
          console.log(`Starting Wi-Fi provisioning for ${deviceId}...`);

          await provisionWifi(deviceId, {
            ssid: values.ssid,
            wifiPassword: values.wifiPassword,
          });
          
          console.log("WiFi provisioning completed successfully!");
          Toast.show({
            type: 'success',
            text1: 'Wi-Fi Re-provisioned',
            text2: 'The board has been successfully re-provisioned with new Wi-Fi credentials.'
          });
          
          await refetchBoards(); 
    
        } catch (err) {
          console.error("Re-provisioning failed:", err);
          Toast.show({
            type: 'error',
            text1: 'Provisioning Failed',
            text2: 'Failed to re-provision Wi-Fi. Please try again.'
          });
        }
    };

    useEffect(() => {
        setLastActive(formatRunningTimeFromTimestamp(board.updated_at, t));
    }, [board.updated_at])

    const onTitleTextLayout = (e: any) => {
        const line = e.nativeEvent.lines?.[0];
        if (line?.width) setTitleWidth(Math.ceil(line.width));
        const wrapped = (e?.nativeEvent?.lines?.length ?? 1) > 1;
        setIsTitleMultiline(wrapped);
    };

    const { loading, editBoardName, deleteBoard, refetchBoards } = useBoard();
    const {provisionWifi} = useBle();

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
            return formatRunningTimeFromTimestamp(board.updated_at, t);
        }
    }, [board.updated_at, board.board_status, tick]);

    const displayStatus = t(displayStatusMap[mode]);

    const handleWifiSubmit = async () => {
        if (!wifiInfo) return;
        console.log("Submitting new Wi-Fi credentials for board:", board.board_id);
        try {
          console.log("Starting WiFi provisioning...");
          await provisionWifi(board.board_id, {
            ssid: wifiInfo?.ssid,
            wifiPassword: wifiInfo?.wifiPassword,
          });
          console.log("WiFi provisioning completed successfully!");
          console.log("WiFi provisioning completed successfully!");
    
          await refetchBoards();
    
    
          setModal("");
        } catch (err) {
          console.error("Provisioning/Pairing failed:", err);
        }
      }

    return (
        <View>
            <TouchableOpacity onPress={handleExpand} disabled={isEditBoardName}>
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
                                    {t('Last Connected')}: {fromISOTimeToLocaleString(board?.updated_at, i18next.language) || 'N/A'}
                                </Text>
                            )}
                            <Text style={[styles.description, { color: textColor }]}>
                                {t('Running')}: {board.board_status === 'active' ? runningTimeActive : lastActive}
                            </Text>
                            <Text style={[styles.description, { color: textColor }]}>
                                {t('Status')}: {board.board_status ? displayStatus : t('status.notAvailable')}
                            </Text>
                        </View>
                        <View style={[styles.leftsection, { gap: mode === "inactive" ? 32 : 18 }]}>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {mode === 'inactive' && (
                                    <ButtonCard
                                        text={t('Reconnect')}
                                        filledColor={buttonBg}
                                        textColor={buttonText}
                                        onPress={() => setModal("wifi-config")}
                                    />
                                )}
                                <ButtonCard
                                    text={t('delete')}
                                    filledColor={buttonBg}
                                    textColor={buttonText}
                                    onPress={() => setModal("delete")}
                                />

                            </View>
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
            {expanded && (
                <CardBoardExpandedWrapped
                    boardFrequency={board.sensor_frequency}
                    board_id={board.board_id}
                    board_status={board.board_status}
                    board_role={board.role}
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

            <WifiConfigModal
                visible={modal === "wifi-config"}
                onClose={() => setModal("")}
                onSubmit={handleReconnectProvision} 
                boardId={board.board_id}
                isBoardIdExists={!!board.board_id}
            />

            <ConnectionPasswordModal
                visible={modal === "connect-password"}
                onClose={() => setModal("")}
                onSubmit={handleWifiSubmit}
            // loading={submitting}
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
        fontSize: theme.fontSize.description,
        fontFamily: theme.fontFamily.regular,
    },
    leftsection: {
        flexDirection: 'column',
        bottom: 0,
        alignSelf: 'flex-start',
        gap: 1,
        marginTop: 12,
    }
});


const fromISOTimeToLocaleString = (isoTime: string, lang: string) => {
    if (!isoTime) return 'N/A'; // Added a check for safety
    const date = new Date(isoTime);
    // Use the `lang` parameter instead of "en-US"
    return date.toLocaleString(lang, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
};
