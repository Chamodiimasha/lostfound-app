import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/AuthContext';
import { Loading } from './src/ui';
import { LoginScreen, RegisterScreen } from './src/screens/AuthScreens';
import ItemsScreen from './src/screens/ItemsScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import ItemFormScreen from './src/screens/ItemFormScreen';
import ClaimFormScreen from './src/screens/ClaimFormScreen';
import MyClaimsScreen from './src/screens/MyClaimsScreen';

const Stack = createNativeStackNavigator();

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return (
    <Stack.Navigator>
      {user ? (
        // Protected area: only mounted when a user is logged in
        <>
          <Stack.Screen name="Items" component={ItemsScreen} options={{ title: 'Lost & Found' }} />
          <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Item' }} />
          <Stack.Screen name="ItemForm" component={ItemFormScreen} options={{ title: 'Item' }} />
          <Stack.Screen name="ClaimForm" component={ClaimFormScreen} options={{ title: 'Claim' }} />
          <Stack.Screen name="MyClaims" component={MyClaimsScreen} options={{ title: 'My Claims' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Root />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
