
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

/*
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';  // ← CHANGÉ
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import CagnotteScreen from './src/screens/CagnotteScreen';  // ← AJOUTÉ

const Tab = createBottomTabNavigator();  // ← CHANGÉ (Tab au lieu de Stack)

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"  // ← Home par défaut
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Home') {
              iconName = focused ? 'location' : 'location-outline';
            } else if (route.name === 'Cagnottes') {
              iconName = focused ? 'cash' : 'cash-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0c5460',
          tabBarInactiveTintColor: '#94a3b8',
          headerShown: false,  // ← Pas d'en-tête
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
            headerTitle: 'Suivi des Campagnes'
          }}
        />
        <Tab.Screen 
          name="Cagnottes" 
          component={CagnotteScreen}
          options={{ 
            tabBarLabel: 'Cagnottes 💰',
            headerTitle: 'Cagnottes Solidaires'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

*/