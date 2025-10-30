import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/theme';
import HalfCircleGauge from '../../../Chart/GaugeChart';
import ButtonModalL from '../../../Buttons/ButtonModalL';
import SensorCard from '../../CardSensorPrimary/SensorCard';
import { useSensor } from '@/src/api/hooks/useSensor';
import { useTranslation } from 'react-i18next';
import { SensorCurrentData } from '@/src/interfaces/sensor';

interface MeasurementDashboardProps {
    boardFrequency: number;
    board_id: string;
    board_status?: 'active' | 'inactive';
}

const { width } = Dimensions.get('window');

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const CardBoardExpandedContent: React.FC<MeasurementDashboardProps> = ({
    boardFrequency,
    board_id,
    board_status = 'inactive'
}) => {
    const { t } = useTranslation();
    const { getSensorBasicInformation, measureCurrent, currentSensorData, sensorData, currentLoading, currentInitialLoading } = useSensor(board_id);

    const stableSensorData = useMemo(() => {
        if (!sensorData) return [];
        return sensorData;
    }, [sensorData?.length]);


    useEffect(() => {
        const init = async () => {
            await getSensorBasicInformation();
        }
        init();
    }, [board_id]);

    const handleMeasureAgain = async (): Promise<void> => {
        await measureCurrent();
    };

    const gaugeGap = clamp(Math.round(width * 0.02), 6, 16);

    const ec = currentSensorData?.ec ? currentSensorData.ec : 0.00;
    const pH = currentSensorData?.ph ? currentSensorData.ph : 0.00;
    const temperature = currentSensorData?.temperature ? currentSensorData.temperature : 0.00;

    const currentECdisplay = ec * 100;
    const currentpHdisplay = pH;
    const currentTemperatureDisplay = temperature;

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Measurements')}</Text>

            <View style={styles.measurementCard}>
                {board_status === 'active' ? <View style={{ alignItems: 'center' }}>
                    <View style={[styles.measurementRow, { gap: gaugeGap }]}>
                        <HalfCircleGauge title={t('pH')} value={currentpHdisplay} unit="" min={0} max={14} threshold_max={7} threshold_min={5.5} extraHorizontalPadding={theme.spacing.md * 2} />
                        <HalfCircleGauge title={t('Temperature')} value={currentTemperatureDisplay} unit="°C" min={-10} max={50} threshold_max={35} threshold_min={30} extraHorizontalPadding={theme.spacing.md * 2} />
                        <HalfCircleGauge title={t('EC')} value={currentECdisplay} unit="µs/cm" min={0} max={700} threshold_max={700} threshold_min={500} extraHorizontalPadding={theme.spacing.md * 2} />
                    </View>

                    <ButtonModalL
                        text={t('Measure')}
                        onPress={handleMeasureAgain}
                        filledColor={theme.colors.primary}
                        textColor={theme.colors.white}
                        marginBottom={3}
                        loading={currentLoading}
                    />
                </View> :
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: theme.colors.text }}>{t('Can not perform measurement')}</Text>
                    </View>
                }

            </View>

            <View style={styles.section}>
                <View style={styles.sensorHeaderContainer}>
                    <Text style={styles.sectionTitle}>{t('Sensors')}</Text>
                </View>
                <View>
                    {stableSensorData?.map((sensor) => (
                        <View key={sensor.id} style={styles.sensorContainer}>
                            <SensorCard
                                key={sensor.id} sensor={sensor} board_uuid={board_id} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    unitButton: {
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: theme.colors.primary,
    },
    unitButtonActive: {
        borderWidth: 1,
        backgroundColor: theme.colors.white,
    },
    unitButtonText: {
        color: theme.colors.white,
        fontFamily: theme.fontFamily.medium,
        fontSize: 12,
    },
    unitButtonTextActive: {
        color: theme.colors.black,
    },
    section: {
        // marginTop: theme.spacing.sm,
        gap: theme.spacing.md,
    },
    frequencySection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    sectionTitle: {
        fontSize: theme.fontSize.header1,
        fontFamily: theme.fontFamily.semibold,
        color: 'black',
        // marginBottom: theme.spacing.lg,
    },
    measurementCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        alignItems: 'center',
    },
    measurementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // gap is injected responsively in component
    },
    measurementItem: {
        alignItems: 'center',
    },
    measurementLabel: {
        fontSize: theme.fontSize.description,
        fontFamily: theme.fontFamily.medium,
        textAlign: 'center',
    },

    circularProgress: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    progressRing: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        bottom: 8,
        borderRadius: 32,
        borderWidth: 10,
        borderColor: 'transparent',
        borderTopColor: theme.colors.success,
    },
    progressBackground: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        bottom: 8,
        borderRadius: 32,
        borderWidth: 10,
        borderColor: 'transparent',
        borderTopColor: '#E8F5F3',
        borderRightColor: '#E8F5F3',
        borderBottomColor: '#E8F5F3',
        borderLeftColor: '#E8F5F3',
    },
    measurementValue: {
        fontSize: theme.fontSize.header2,
        fontWeight: 'bold',
        fontFamily: theme.fontFamily.bold,
        color: theme.colors.primary,
    },
    measurementValueContainer: {
        alignItems: 'center',
    },
    measurementUnit: {
        fontSize: theme.fontSize.xs,
        fontFamily: theme.fontFamily.regular,
        color: '#666',
    },
    measureButton: {
        backgroundColor: theme.colors.primary,
        // paddingVertical: theme.spacing.md, // now responsive
        paddingHorizontal: theme.spacing.xl,
        // borderRadius: 30,                   // now responsive
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        // width: '50%'                        // now responsive
    },
    measureButtonText: {
        color: theme.colors.white,
        // fontSize: theme.fontSize.description, // now responsive
        fontFamily: theme.fontFamily.semibold,
    },
    measureButtonDisabled: {
        opacity: 0.6,
    },

    disconnectButton: {
        backgroundColor: theme.colors.white,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: 25,
        marginRight: theme.spacing.md,
    },
    connectButton: {
        backgroundColor: theme.colors.success,
    },
    disconnectButtonText: {
        color: theme.colors.primary,
        fontSize: theme.fontSize.data_text,
        fontFamily: theme.fontFamily.semibold,
    },
    connectButtonText: {
        color: theme.colors.white,
    },
    sensorContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xs,
    },
    sensorHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingVertical: theme.spacing.xs,
    },
    sectionSubtitle: {
        fontSize: theme.fontSize.header2,
        fontFamily: theme.fontFamily.semibold,
        color: '#333',
        // alignSelf: 'center'
    },
    frequencyContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8
    },
    submitFrequencyButton: {
        backgroundColor: theme.colors.primary, // Green background
        borderRadius: 6,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 32,
        minHeight: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    submitFrequencyButtonDisabled: {
        backgroundColor: theme.colors.success,
        opacity: 0.6,
    },
});

export default CardBoardExpandedContent;
