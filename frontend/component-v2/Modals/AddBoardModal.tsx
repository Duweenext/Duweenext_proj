import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ButtonModalXL from '@/component-v2/Buttons/ButtonModalXL';

interface AddBoardModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectManual: () => void;
    onSelectBLE: () => void;
}

const AddBoardModal: React.FC<AddBoardModalProps> = ({
    visible,
    onClose,
    onSelectManual,
    onSelectBLE,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        {/* <View style={styles.header}/> */}
                        <Text style={styles.title}>Add board</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.container_content}>
                        {/* <Text style={styles.subtitle}>Choose a mode to add a board.</Text> */}
                        <View style={styles.content}>
                            <Text style={styles.description}>Manual mode requires a Board ID.</Text>

                            {/* Manual Button */}
                            <View style={styles.buttonContainer}>
                                <ButtonModalXL
                                    text="Manual"
                                    filledColor="#2c5f54"
                                    textColor="white"
                                    onPress={onSelectManual}
                                    size='2XL'
                                />
                            </View>
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.description}>BLE mode scans nearby devices.</Text>

                            {/* BLE Button */}
                            <View style={styles.buttonContainer}>
                                <ButtonModalXL
                                    text="BLE"
                                    filledColor="#2c5f54"
                                    textColor="white"
                                    onPress={onSelectBLE}
                                    size='2XL'
                                />
                            </View>
                        </View>



                    </View>
                    <View style={styles.instructionsOuterContainer}>
                        <View style={styles.instructionsContainer}>
                            <Text style={styles.instructionsTitle}>Instructions:</Text>
                            <Text style={styles.instructionItem}>1. To register the board you must use BLE options</Text>
                            <Text style={styles.instructionItem}>2. To register the board you must use BLE options</Text>
                            <Text style={styles.instructionItem}>3. To register the board you must use BLE options</Text>
                            <Text style={styles.instructionItem}>4. To register the board you must use BLE options</Text>
                        </View>
                    </View>
                        {/* Instructions Section */}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 2,
        flexDirection: 'column',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#2c5f54',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',

    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container_content: {
        flexDirection: 'column',
        paddingVertical: 20,
        gap: 20,
    },
    content: {
        paddingHorizontal: 20,
        // paddingVertical: -10,
        // gap: -5,
        // alignItems: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 12,
        color: '#b4b8bfff',
        // textAlign: 'start',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
    },
    instructionsOuterContainer: {
        paddingHorizontal: 24,
    },
    instructionsContainer: {
        // marginTop: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        alignSelf: 'stretch',
    },
    instructionsTitle: {
        fontSize: 14,
        color: '#ef4444',
        fontWeight: '600',
        marginBottom: 8,
    },
    instructionItem: {
        fontSize: 12,
        color: '#ef4444',
        marginBottom: 4,
        paddingLeft: 8,
    },
});

export default AddBoardModal;
