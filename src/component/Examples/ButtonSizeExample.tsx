// Example usage of the updated ButtonModalXL and ButtonModalL components with size variants

import React from 'react';
import { View } from 'react-native';
import ButtonModalXL from '../Buttons/ButtonModalXL';
import ButtonModalL from '../Buttons/ButtonModalL';

const ButtonSizeExample = () => {
  return (
    <View style={{ padding: 20, gap: 16 }}>
      {/* ButtonModalXL with different sizes */}
      <ButtonModalXL 
        text="Size L" 
        size="L"
        filledColor="#2c5f54"
        textColor="white"
      />
      
      <ButtonModalXL 
        text="Size XL (Default)" 
        size="XL"
        filledColor="#2c5f54"
        textColor="white"
      />
      
      <ButtonModalXL 
        text="Size 2XL" 
        size="2XL"
        filledColor="#2c5f54"
        textColor="white"
      />
      
      <ButtonModalXL 
        text="Size 3XL" 
        size="3XL"
        filledColor="#2c5f54"
        textColor="white"
      />

      {/* ButtonModalL with different sizes */}
      <ButtonModalL 
        text="L Size L (Default)" 
        size="L"
        filledColor="#ffffff"
        textColor="#000000"
      />
      
      <ButtonModalL 
        text="L Size XL" 
        size="XL"
        filledColor="#ffffff"
        textColor="#000000"
      />
      
      <ButtonModalL 
        text="L Size 2XL" 
        size="2XL"
        filledColor="#ffffff"
        textColor="#000000"
      />
      
      <ButtonModalL 
        text="L Size 3XL" 
        size="3XL"
        filledColor="#ffffff"
        textColor="#000000"
      />
    </View>
  );
};

export default ButtonSizeExample;
