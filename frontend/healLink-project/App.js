
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import QRCodeScreen from './src/screens/qr_display';
import QrScanner from './src/screens/qrscanner';
import { WebSocketProvider } from './src/utils/websocketProvider';
import { Ionicons } from '@expo/vector-icons'; 


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
                  } else if (route.name === 'Qr scan') {
                    iconName = focused ? 'information-circle' : 'information-circle-outline';
                  } else if (route.name === 'Qr') {
                    iconName = focused ? 'qr-code' : 'qr-code-outline';
      
                  }
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
              })}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Qr scan" component={QrScanner} />
              <Tab.Screen name="Qr" component={QRCodeScreen} />

            </Tab.Navigator>
    </NavigationContainer>
    </WebSocketProvider>
  );
}
