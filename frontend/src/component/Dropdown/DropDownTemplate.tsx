import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';

interface DropDownTemplateProps {
  label: string;
  options: string[];
  onSelect?: (value: string) => void;
}

const DropDownTemplate: React.FC<DropDownTemplateProps> = ({
  label,
  options,
  onSelect = () => {},
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
    <View style={styles.container}>
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
        <View style={styles.dropdown}>
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
        </View>
      )}
    </View>
  );
};

const WIDTH = 180;

const styles = StyleSheet.create({
  container: {
    width: WIDTH,
    marginVertical: 10,
  },
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
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    backgroundColor: '#FFF',
    width: WIDTH,
    overflow: 'hidden',
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
