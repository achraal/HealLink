import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebaseConfig';

// Écrans principaux
import HomeScreen from './src/screens/HomeScreen';
import CagnotteScreen from './src/screens/CagnotteScreen';
import QRCodeScreen from './src/screens/qr_display';
import QrScanner from './src/screens/qrscanner';

// Écrans d'authentification (à créer)
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

import { WebSocketProvider } from './src/utils/websocketProvider';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Navigation par onglets pour les utilisateurs authentifiés
function MainTabs() {
  return (
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
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe; // Nettoyage lors du démontage
  }, []);

  // Écran de chargement pendant la vérification de l'authentification
  if (loading) {
    return null; // Ou créez un écran de chargement personnalisé
  }

  return (
    <SafeAreaProvider>
      <WebSocketProvider>
        <NavigationContainer>
          {user ? (
            // Utilisateur connecté : afficher les onglets
            <MainTabs />
          ) : (
            // Utilisateur non connecté : afficher les écrans d'authentification
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false,
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </WebSocketProvider>
    </SafeAreaProvider>
  );
}
