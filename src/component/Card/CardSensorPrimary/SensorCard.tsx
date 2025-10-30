import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from '@/theme';
import SensorBoardExpand from "./SensorBoardExpand";
import { SensorDataBackend } from "@/src/interfaces/sensor";
import { useTranslation } from "react-i18next";
import { useSensorExpandStore } from "@/src/api/hooks/useSensor";

const SensorExpandMemo = React.memo(SensorBoardExpand);

const SensorTab: React.FC<{
    sensor: SensorDataBackend,
    board_uuid: string,
}> = ({ sensor, board_uuid }) => {
    const { expandedSensors, toggleSensor } = useSensorExpandStore();
    const expanded = expandedSensors[sensor.id] || false;

    const { t } = useTranslation();

    return (
        <View>
            <TouchableOpacity onPress={() => toggleSensor(sensor.id.toString())}>
                <View key={sensor.id} style={[styles.sensorCard,
                    , {
                    borderBottomEndRadius: expanded ? 0 : theme.borderRadius.lg,
                    borderBottomStartRadius: expanded ? 0 : theme.borderRadius.lg,
                }
                ]}>
                    <View style={styles.sensorInfo}>
                        <Text style={styles.sensorName}>{t(sensor.sensor_type)}</Text>
                    </View>
                    <View style={styles.sensorActions}>
                        <Text style={styles.chevron}>›</Text>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={{ display: expanded ? 'flex' : 'none' }}>
                <SensorExpandMemo sensor={sensor} boardId={board_uuid} />
            </View>
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
