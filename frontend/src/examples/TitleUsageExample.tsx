// Example of how to use the title utilities in other components

import React from 'react';
import { Text, View } from 'react-native';
import { useTitle, getTitleFromPath } from '@/src/hooks/useTitle';

// Method 1: Using the hook (inside React components)
export function ComponentWithHook() {
  const title = useTitle();
  
  return (
    <View>
      <Text>Current Page: {title}</Text>
    </View>
  );
}

// Method 2: Using the utility function directly (for static scenarios)
export function ComponentWithUtility() {
  const staticTitle = getTitleFromPath('/some/path');
  
  return (
    <View>
      <Text>Static Title: {staticTitle}</Text>
    </View>
  );
}

// Method 3: Using in event handlers or effects
export function ComponentWithEffects() {
  const title = useTitle();
  
  React.useEffect(() => {
    console.log('Current page title:', title);
    // You can use the title for logging, analytics, etc.
  }, [title]);
  
  const handleClick = () => {
    // You can also get titles for specific paths
    const homeTitle = getTitleFromPath('/');
    console.log('Home title would be:', homeTitle);
  };
  
  return (
    <View>
      <Text onPress={handleClick}>Current: {title}</Text>
    </View>
  );
}
