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
import { Board, BoardRelationship } from '@/src/interfaces/board';
import CardBoardExpanded from './CardboardExpand';
import ButtonCard from '../../Buttons/ButtonCard';

type Mode = 'active' | 'inactive';

const displayStatusMap = {
    active: 'Connected',
    inactive: 'Disconnected',
} as const;

const displayStatusActionLabel = {
    active: 'Disconnect',
    inactive: 'Connect',
}

interface Esp32CardProps {
    runningTime?: string;
    onIconPress?: (e: GestureResponderEvent) => void;
    onButtonPress?: (e: GestureResponderEvent) => void;
    board: BoardRelationship;
    frequency?: number;
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
    runningTime = '0 hours 0 minutes',
    onButtonPress,
    board,
}) => {
    const mode = board?.con_status || 'inactive' as Mode;
    const boardName = board?.board_name || 'Unknown Board';
    const [expanded, setExpanded] = useState(false);
    const { cardBg, textColor, buttonBg, buttonText, iconColor } =
        variants[mode] || variants.inactive;
    const actionLabel = displayStatusActionLabel[mode];

    return (
        <View>
            <TouchableOpacity onPress={() => setExpanded(!expanded)} disabled={mode !== 'active'}>
                <View style={[styles.card, {
                    backgroundColor: cardBg,
                    borderBottomEndRadius: expanded ? 0 : theme.borderRadius.lg,
                    borderBottomStartRadius: expanded ? 0 : theme.borderRadius.lg,
                }]}>
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: textColor }]}>
                            {boardName}
                        </Text>
                        {mode === 'inactive' && (
                            <Text style={[styles.description, { color: textColor }]}>
                                Last connected: {board?.updated_at || 'N/A'}
                            </Text>
                        )}
                        <Text style={[styles.description, { color: textColor }]}>
                            Running: {runningTime}
                        </Text>
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
                        <TouchableOpacity style={styles.iconButton} onPress={() => setExpanded(!expanded)}>
                            <Ionicons
                                name={expanded ? "chevron-down" : "chevron-forward"}
                                size={24}
                                color={iconColor}
                            />
                        </TouchableOpacity>
                        <ButtonCard
                            text={actionLabel}
                            filledColor={buttonBg}
                            textColor={buttonText}
                            onPress={onButtonPress}
                        />
                    </View>
                </View>

            </TouchableOpacity>
            {expanded && mode === "active" && (
                <CardBoardExpanded
                    boardFrequency={board.sensor_frequency}
                    board_id={board.board_id}
                />
            )}
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
        gap: 2,
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
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 18,
        // height: '100%',
        marginBottom: 8, // to align with content
    }
});
