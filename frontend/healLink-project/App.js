import 'react-native-gesture-handler';

import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import QRCodeScreen from './src/screens/qr_display';
import QrScanner from './src/screens/qrscanner';
import { WebSocketProvider } from './src/utils/websocketProvider';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <WebSocketProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Scan">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Suivi des Campagnes" }} />
        <Stack.Screen name="QR" component={QRCodeScreen} options={{ title: "Afficher son QR" }} />
        <Stack.Screen name="Scan" component={QrScanner} options={{ title: "Scanner un code QR" }} />
      </Stack.Navigator>
    </NavigationContainer>
    </WebSocketProvider>
  );
}
