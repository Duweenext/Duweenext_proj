import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from '@/theme';
import SensorBoardExpand from "./SensorBoardExpand";
import { SensorDataBackend } from "@/src/interfaces/sensor";

const SensorTab: React.FC<{ sensor: SensorDataBackend , board_uuid: string}> = ({ sensor , board_uuid}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <View>
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <View key={sensor.id} style={[styles.sensorCard,
                    , {
                    borderBottomEndRadius: expanded ? 0 : theme.borderRadius.lg,
                    borderBottomStartRadius: expanded ? 0 : theme.borderRadius.lg,
                }
                ]}>
                    <View style={styles.sensorInfo}>
                        <Text style={styles.sensorName}>{sensor.sensor_type}</Text>
                    </View>
                    <View style={styles.sensorActions}>
                        <Text style={styles.chevron}>›</Text>
                    </View>
                </View>
            </TouchableOpacity>
            {expanded && <SensorBoardExpand sensor={sensor} boardId={board_uuid}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    sensorInfo: {
        flex: 1,
    },
    sensorName: {
        color: theme.colors.white,
        fontSize: theme.fontSize.header2,
        fontFamily: theme.fontFamily.semibold,
        marginBottom: theme.spacing.xxs,
    },
    sensorStatus: {
        color: theme.colors.secondary,
        fontSize: theme.fontSize.data_text,
        fontFamily: theme.fontFamily.regular,
    },
    sensorActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chevron: {
        color: theme.colors.white,
        fontSize: theme.fontSize['2xl'],
        fontFamily: theme.fontFamily.bold,
    },
    sensorCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        // marginBottom: theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})

export default SensorTab;
