import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // for nice tab icons

import HomeScreen from './screens/homescrreen';
import DetailsScreen from './screens/DetailsScreen';
import MapScreen from './screens/map';
import QrScanner from './screens/qrscanner';
import { WebSocketProvider } from './utils/websocketProvider';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <WebSocketProvider>
    <NavigationContainer>
      
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // hide header bar
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Details') {
              iconName = focused ? 'information-circle' : 'information-circle-outline';
            } else if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            }else if (route.name === 'Qr') {
              iconName = focused ? 'qr-code' : 'qr-code-outline';

            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Details" component={DetailsScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Qr" component={QrScanner} />
      </Tab.Navigator>
    </NavigationContainer>
    </WebSocketProvider>
  );
}
