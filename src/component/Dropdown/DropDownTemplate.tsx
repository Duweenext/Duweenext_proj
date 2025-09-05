import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface DropDownTemplateProps {
  label: string;
  options: string[];
  onSelect?: (value: string) => void;
  width?: number;
}

const DropDownTemplate: React.FC<DropDownTemplateProps> = ({
  label,
  options,
  onSelect = () => { },
  width = 150,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(label);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (item: string) => {
    setSelected(item);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <View style={width ? { width } : { minWidth: 150 }}>
      <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
        <Text style={styles.selectedText}>{selected}</Text>
        <Image
          source={{
            uri: 'https://img.icons8.com/ios-filled/50/expand-arrow--v1.png',
          }}
          style={styles.arrow}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.dropdown, width ? { width } : { minWidth: 150 }]}>
          <ScrollView>
            <FlatList
              data={options.filter(opt => opt !== selected)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#000',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrow: {
    width: 20,
    height: 20,
    tintColor: '#888',
  },
  dropdown: {
    position: 'absolute', // Make it absolute
    top: '100%', // Position below the button
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    zIndex: 1001, // Higher than container
    maxHeight: 200, // Limit height for scrolling
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  optionText: {
    color: '#227C71',
    fontSize: 15,
  },
});

export default DropDownTemplate;
