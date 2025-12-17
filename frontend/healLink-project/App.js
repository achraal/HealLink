import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import CagnotteScreen from './src/screens/CagnotteScreen';
import QRCodeScreen from './src/screens/qr_display';
import QrScanner from './src/screens/qrscanner';
import { WebSocketProvider } from './src/utils/websocketProvider';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <WebSocketProvider>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
              headerShown: true,
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = focused ? 'location' : 'location-outline';
                } else if (route.name === 'Cagnottes') {
                  iconName = focused ? 'cash' : 'cash-outline';
                } else if (route.name === 'Qr scan') {
                  iconName = focused ? 'scan' : 'scan-outline';
                } else if (route.name === 'Qr') {
                  iconName = focused ? 'qr-code' : 'qr-code-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#0c5460',
              tabBarInactiveTintColor: '#94a3b8',
              tabBarStyle: {
                paddingBottom: 10,
                height: 70,
                backgroundColor: '#f8fafc',
                borderTopWidth: 0,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
              },
            })}
          >
            <Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    tabBarLabel: 'Centres',
    title: 'HealLink – Centres',
    headerTitleAlign: 'center',
    headerStyle: {
      backgroundColor: '#0c5460',
    },
    headerTintColor: '#ffffff',
    headerTitleStyle: {
      fontWeight: '700',
      fontSize: 18,
    },
  }}
/>

<Tab.Screen
  name="Cagnottes"
  component={CagnotteScreen}
  options={{
    tabBarLabel: 'Cagnottes 💰',
    title: 'HealLink – Cagnottes',
    headerTitleAlign: 'center',
    headerStyle: {
      backgroundColor: '#0c5460',
    },
    headerTintColor: '#ffffff',
    headerTitleStyle: {
      fontWeight: '700',
      fontSize: 18,
    },
  }}
/>

<Tab.Screen
  name="Qr scan"
  component={QrScanner}
  options={{
    tabBarLabel: 'Scan QR',
    title: 'HealLink – Scan QR',
    headerTitleAlign: 'center',
    headerStyle: {
      backgroundColor: '#0c5460',
    },
    headerTintColor: '#ffffff',
    headerTitleStyle: {
      fontWeight: '700',
      fontSize: 18,
    },
  }}
/>

<Tab.Screen
  name="Qr"
  component={QRCodeScreen}
  options={{
    tabBarLabel: 'Mon QR',
    title: 'HealLink – Mon QR',
    headerTitleAlign: 'center',
    headerStyle: {
      backgroundColor: '#0c5460',
    },
    headerTintColor: '#ffffff',
    headerTitleStyle: {
      fontWeight: '700',
      fontSize: 18,
    },
  }}
/>

          </Tab.Navigator>
        </NavigationContainer>
      </WebSocketProvider>
    </SafeAreaProvider>
  );
}
