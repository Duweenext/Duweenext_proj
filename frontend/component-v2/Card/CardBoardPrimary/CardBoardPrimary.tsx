// components/Esp32Card.tsx
import React, { useState } from 'react';
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
import { Board } from '@/srcs/interfaces/board';
import { CardBoardExpanded } from './CardboardExpand';

type Mode = 'connected' | 'failed' | 'disconnected';

const displayStatusMap = {
    connected: 'Connected',
    failed: 'Unable to connect',
    disconnected: 'Disconnected',
} as const;

const displayStatusActionLabel = {
    connected: 'Disconnect',
    failed: 'Connect again',
    disconnected: 'Connect',
}

interface Esp32CardProps {
    runningTime?: string;
    onIconPress?: (e: GestureResponderEvent) => void;
    onButtonPress?: (e: GestureResponderEvent) => void;
    board?: Board;
}

// everything in one place:
const variants: Record<
    Mode,
    {
        cardBg: string;
        textColor: string;
        buttonBg: string;
        buttonText: string;
        iconColor: string;
    }
> = {
    connected: {
        cardBg: theme.colors.primary,
        textColor: '#FFFFFF',
        buttonBg: '#FFFFFF',
        buttonText: theme.colors.primary,
        iconColor: '#FFFFFF',
    },
    failed: {
        cardBg: theme.colors.fail,
        textColor: '#FFFFFF',
        buttonBg: '#FFFFFF',
        buttonText: theme.colors.fail,
        iconColor: '#FFFFFF',
    },
    disconnected: {
        cardBg: theme.colors['background1'],
        textColor: '#000000',
        buttonBg: '#FFFFFF',
        buttonText: '#000000',
        iconColor: '#ffffff',
    },
};

const CardBoardPrimary: React.FC<Esp32CardProps> = ({
    runningTime = '0 hours 0 minutes',
    onIconPress,
    onButtonPress,
    board,
}) => {
    const mode = board?.board_status || 'disconnected' as Mode;
    const boardName = board?.board_name || 'Unknown Board';
    const [expanded, setExpanded] = useState(false);
    // const lastConnected = board?.updated_at ?? 
    console.log('CardBoardPrimary mode:', board?.board_status);
    const { cardBg, textColor, buttonBg, buttonText, iconColor } =
        variants[mode] || variants.disconnected;
    const actionLabel = displayStatusActionLabel[mode];

    return (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <View style={[styles.container,
            {
                borderBottomEndRadius: expanded ? 0 : parseInt(theme.borderRadius.lg, 10),
                borderBottomStartRadius: expanded ? 0 : parseInt(theme.borderRadius.lg, 10)
            }]}>
                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: textColor }]}>
                            {boardName}
                        </Text>
                        {mode === 'disconnected' && (
                            <Text style={[styles.description, { color: textColor }]}>
                                Last connected: {board?.updated_at || 'N/A'}
                            </Text>
                        )}
                        {mode === 'failed' ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <Text style={[styles.description, { color: textColor }]}>
                                    Why is it not connecting?
                                </Text>
                                <TouchableOpacity onPress={onIconPress}>
                                    <Ionicons name="help-circle-outline" size={18} color={iconColor} />
                                </TouchableOpacity>
                            </View>

                        ) : (
                            <Text style={[styles.description, { color: textColor }]}>
                                Running: {runningTime}
                            </Text>
                        )}
                        <Text style={[styles.description, { color: textColor }]}>
                            Status: {displayStatusMap[mode]}
                        </Text>
                    </View>

                    {/* Last‐connected timestamp */}
                    <View style={styles.timestamp}>
                        <Text style={[styles.description, { color: textColor }]}>
                            {/* {lastConnected} */}
                        </Text>
                    </View>

                    {/* Action button */}
                    <View style={styles.leftsection}>
                        <TouchableOpacity style={styles.iconButton} onPress={onIconPress}>
                            <Ionicons name="chevron-forward" size={24} color={iconColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: buttonBg }]}
                            onPress={onButtonPress}
                        >
                            <Text style={[styles.actionText, { color: buttonText }]}>
                                {actionLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
                {expanded && (
                    <CardBoardExpanded
                        max={0}
                        min={0}
                        frequency={0}
                        onMaxChange={(v) => {/* … */ }}
                        onMinChange={(v) => {/* … */ }}
                        onFreqChange={(v) => {/* … */ }}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default CardBoardPrimary;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    card: {
        width: '95%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 16,
        borderTopLeftRadius: parseInt(theme.borderRadius.lg, 10),
        borderTopRightRadius: parseInt(theme.borderRadius.lg, 10),
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
        flex: 1,
        marginHorizontal: 8,
        gap: 2,
    },
    timestamp: {
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    title: {
        fontSize: parseInt(theme.fontSize['header3'], 10),
        fontFamily: theme.fontFamily['r-medium'][0],
    },
    description: {
        // marginTop: 4,
        fontSize: parseInt(theme.fontSize.description, 10),
        fontFamily: theme.fontFamily['r-regular'][0],
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: parseInt(theme.borderRadius.md, 10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: parseInt(theme.fontSize.description, 10),
        fontFamily: theme.fontFamily['r-medium'][0],
    },
    leftsection: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: '100%',
        marginBottom: 8, // to align with content
    }
});
