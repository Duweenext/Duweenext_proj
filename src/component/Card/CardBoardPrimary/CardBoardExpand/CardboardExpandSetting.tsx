import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import DropDownTemplate from '../../../Dropdown/DropDownTemplate';
import ButtonModalL from '../../../Buttons/ButtonModalL';
import TextFieldSensorValue from '../../../TextFields/TextFieldSensorValue';
import IconButton from '../../../Buttons/IconButton';
import { useBoard } from '@/src/api/hooks/useBoard';
import { useBoardFrequency, FrequencyUnit } from '@/src/component/Card/CardBoardPrimary/_useBoardZustand';
import { useSensor } from '@/src/api/hooks/useSensor';
export type BoardRole = 'owner' | 'admin' | 'labor' | 'member';

export const getSensorSuffix = (type: string): string => {
    switch (type) {
        case 'Temperature': return '°C';
        case 'pH': return '';
        case 'EC': return ' μS';
        default: return '';
    }
};

interface MeasurementDashboardProps {
    boardFrequency: number;
    board_id: string;
    board_status?: 'active' | 'inactive';
    role?: BoardRole;
}

const CardBoardExpandedSetting: React.FC<MeasurementDashboardProps> = ({
    boardFrequency,
    board_id,
    board_status = 'inactive',
    role = 'member',
}) => {
    const { t } = useTranslation();
    const { setBoardFrequency, frequencyLoading } = useBoard();
    const { getBoardFrequencyLocal, setBoardFrequencyLocal } = useBoardFrequency();

    const saved = getBoardFrequencyLocal(board_id);
    const [frequency, setFrequency] = useState(saved?.frequency ?? boardFrequency ?? 5);
    const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>(saved?.frequencyUnit ?? 'second');
    const [savedFrequencyUnit, setSavedFrequencyUnit] = useState<FrequencyUnit>(frequencyUnit);
    const [isCustomEditFrequency, setIsCustomEditFrequency] = useState(false);

    const isEditable = role === 'owner' || role === 'admin' || role === 'labor';

    useEffect(() => {
        setBoardFrequencyLocal(board_id, frequency, frequencyUnit);
    }, [frequency, frequencyUnit]);

    useEffect(() => {
        let displayFrequency = boardFrequency;
        let displayUnit: FrequencyUnit = 'second';

        if (boardFrequency >= 3600) {
            displayFrequency = boardFrequency / 3600;
            displayUnit = 'hour';
        } else if (boardFrequency >= 60) {
            displayFrequency = boardFrequency / 60;
            displayUnit = 'minute';
        }

        setFrequency(displayFrequency);
        setFrequencyUnit(displayUnit);
        setSavedFrequencyUnit(displayUnit);
        setBoardFrequencyLocal(board_id, displayFrequency, displayUnit);
    }, [board_id]);

    const getFrequencyOptions = () => {
        switch (frequencyUnit) {
            case 'second': return [1, 5, 10, 15, 30, 60].map(v => `${t('every')} ${v} ${t('second')}`);
            case 'minute': return [1, 5, 10, 15, 30, 60].map(v => `${t('every')} ${v} ${t('minute')}`);
            case 'hour': return [1, 2, 6, 12, 24].map(v => `${t('every')} ${v} ${t('hour')}`);
            case 'day': return [1, 2, 3, 7].map(v => `${t('every')} ${v} ${t('day')}`);
            case 'week': return [1, 2, 3, 4].map(v => `${t('every')} ${v} ${t('week')}`);
            default: return [];
        }
    };

    const updateBoardFrequency = async (newFrequency: number) => {
        try {
            const multiplier = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800 }[frequencyUnit];
            const frequencyInSeconds = newFrequency * multiplier;

            await setBoardFrequency(board_id, frequencyInSeconds);

            setBoardFrequencyLocal(board_id, newFrequency, frequencyUnit);
            setSavedFrequencyUnit(frequencyUnit);
            setIsCustomEditFrequency(false);
        } catch (err) {
            console.error('Failed to update board frequency:', err);
        }
    };

    const { sensorData: sensors, setBoardThreshold, sensorDataLoading } = useSensor(board_id);

    const [editedThresholds, setEditedThresholds] = useState<Record<
        number,
        { max: number; min: number }
    >>({});

    const handleThresholdChange = (
        sensorId: number,
        field: 'max' | 'min',
        value: number
    ) => {
        setEditedThresholds((prev) => {
            // Find the original sensor to get its default thresholds
            const originalSensor = sensors?.find(s => s.id === sensorId);

            // Get the current edited values for this sensor, or fall back to the original values
            const currentThresholds = prev[sensorId] || {
                max: originalSensor?.sensor_threshold_max ?? 0,
                min: originalSensor?.sensor_threshold_min ?? 0,
            };

            // Return the updated state
            return {
                ...prev,
                [sensorId]: {
                    ...currentThresholds, // Now safely spreading an object
                    [field]: value,
                },
            };
        });
    };

    const updateSensorThreshold = async (sensorId: number) => {
        try {
            const edited = editedThresholds[sensorId];
            if (!edited) return;

            await setBoardThreshold(
                sensors?.find((s) => s.id === sensorId)?.sensor_type || '',
                edited.max,
                edited.min
            );

            console.log(`Threshold for sensor ${sensorId} updated`);
        } catch (err) {
            console.error('Failed to update threshold:', err);
        }
    };


    return (
        <View style={styles.section}>
            {role === 'member' ? (
                <View style={styles.measurementCard}>
                    <Text style={styles.sectionTitle}>
                        {t('Board Frequency')}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                        {t('Current')}: {frequency} {t(savedFrequencyUnit)}
                    </Text>
                </View>
            ) : (
                <>
                    <Text style={styles.sectionTitle}>{t('Board Frequency')}</Text>

                    {/* Frequency unit selector */}
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                        {['second', 'minute', 'hour', 'day', 'week'].map((unit) => (
                            <TouchableOpacity
                                key={unit}
                                style={[
                                    styles.unitButton,
                                    frequencyUnit === unit && styles.unitButtonActive,
                                ]}
                                onPress={() => setFrequencyUnit(unit as FrequencyUnit)}
                            >
                                <Text
                                    style={[
                                        styles.unitButtonText,
                                        frequencyUnit === unit && styles.unitButtonTextActive,
                                    ]}
                                >
                                    {t(unit)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.frequencySection}>
                        {!isCustomEditFrequency ? (
                            <DropDownTemplate
                                options={[...getFrequencyOptions(), t('custom')]}
                                label={`${t('selected')}: ${frequency} ${t(frequencyUnit)}`}
                                width={200}
                                onSelect={(value) => {
                                    if (value === t('custom')) setIsCustomEditFrequency(true);
                                    else {
                                        const numMatch = value.match(/\d+/);
                                        if (numMatch) setFrequency(parseInt(numMatch[0], 10));
                                    }
                                }}
                            />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <TextFieldSensorValue
                                    defaultValue={frequency}
                                    onChange={(value: number) => setFrequency(value)}
                                    height={38}
                                    width={70}
                                    fontSize={12}
                                />
                                <Text style={{ fontSize: 16 }}>{t(frequencyUnit)}</Text>

                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    <IconButton
                                        source={require('@/assets/icons/check.png')}
                                        size={30}
                                        iconSize={30}
                                        tintColor={theme.colors.primary}
                                        onPress={() => updateBoardFrequency(frequency)}
                                    />
                                    <IconButton
                                        source={require('@/assets/icons/cancel.png')}
                                        size={30}
                                        iconSize={30}
                                        tintColor={theme.colors.fail}
                                        onPress={() => setIsCustomEditFrequency(false)}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {!isCustomEditFrequency && (
                        <ButtonModalL
                            text={t('Submit')}
                            onPress={() => updateBoardFrequency(frequency)}
                            filledColor={theme.colors.primary}
                            textColor={theme.colors.white}
                            marginBottom={3}
                            size="L"
                            borderRadius="XS"
                            loading={frequencyLoading}
                        />
                    )}

                    <Text style={{ fontSize: 12, color: '#666' }}>
                        {t('Current frequency')}: {frequency} {t(savedFrequencyUnit)}
                    </Text>
                </>
            )}

            <View style={styles.thresholdSection}>
                <Text style={styles.sectionTitle}>{t('Sensor Thresholds')}</Text>

                {sensors?.map((sensor) => (
                    <View key={sensor.id} style={styles.sensorContainer}>
                        <Text style={styles.sensorName}>
                            {t(sensor.sensor_type)} ({sensor.sensor_type})
                        </Text>

                        {role === 'member' ? (
                            <View style={styles.readOnlyRow}>
                                <Text style={styles.readOnlyText}>
                                    {t('Max')}: {sensor.sensor_threshold_max} {getSensorSuffix(sensor.sensor_type)}
                                </Text>
                                <Text style={styles.readOnlyText}>
                                    {t('Min')}: {sensor.sensor_threshold_min} {getSensorSuffix(sensor.sensor_type)}
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.thresholdRow}>
                                    <Text style={styles.thresholdLabel}>{t('Max')}:</Text>
                                    <TextFieldSensorValue
                                        defaultValue={sensor.sensor_threshold_max}
                                        onChange={(val: number) =>
                                            handleThresholdChange(sensor.id, 'max', val)
                                        }
                                        height={36}
                                        fontSize={12}
                                        width={80}
                                    />
                                    <Text style={styles.unitText}>{getSensorSuffix(sensor.sensor_type)}</Text>
                                </View>

                                <View style={styles.thresholdRow}>
                                    <Text style={styles.thresholdLabel}>{t('Min')}:</Text>
                                    <TextFieldSensorValue
                                        defaultValue={sensor.sensor_threshold_min}
                                        onChange={(val: number) =>
                                            handleThresholdChange(sensor.id, 'min', val)
                                        }
                                        height={36}
                                        fontSize={12}
                                        width={80}
                                    />
                                    <Text style={styles.unitText}>{getSensorSuffix(sensor.sensor_type)}</Text>
                                </View>

                                <ButtonModalL
                                    text={t('Update')}
                                    onPress={() => updateSensorThreshold(sensor.id)}
                                    filledColor={theme.colors.primary}
                                    textColor={theme.colors.white}
                                    marginBottom={6}
                                    size="M"
                                    borderRadius="XS"
                                />
                            </>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: { gap: theme.spacing.md },
    sectionTitle: {
        fontSize: theme.fontSize.header1,
        fontFamily: theme.fontFamily.semibold,
        color: 'black',
    },
    unitButton: {
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: theme.colors.primary,
    },
    unitButtonActive: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
    },
    unitButtonText: {
        color: theme.colors.white,
        fontSize: 12,
        fontFamily: theme.fontFamily.medium,
    },
    unitButtonTextActive: {
        color: theme.colors.black,
    },
    frequencySection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    measurementCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
    },
    sectionSubtitle: {
        fontSize: theme.fontSize.description,
        fontFamily: theme.fontFamily.regular,
        color: 'black',
    },
    thresholdSection: {
        marginTop: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    sensorContainer: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    sensorName: {
        fontSize: theme.fontSize.header2,
        fontFamily: theme.fontFamily.semibold,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
    },
    thresholdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    thresholdLabel: {
        fontSize: theme.fontSize.data_text,
        fontFamily: theme.fontFamily.medium,
        color: theme.colors.text,
        width: 40,
    },
    unitText: {
        fontSize: theme.fontSize.data_text,
        color: theme.colors.text,
    },
    readOnlyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        marginBottom: theme.spacing.xs,
    },
    readOnlyText: {
        fontSize: 14,
        fontFamily: theme.fontFamily.medium,
        color: '#333',
    },

});

export default CardBoardExpandedSetting;
